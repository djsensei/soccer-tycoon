/* Markov Graph Editor — Soccer Tycoon dev tool
   Reads MARKOV_TRANSITIONS, STAT_INFLUENCES, STATS from data.js (loaded via script tag) */

(function () {
  'use strict';

  // ===== Default node positions (can be overridden from localStorage) =====
  const DEFAULT_POSITIONS = {
    kickoff:              { x: 300, y: 450 },
    poss_gk_atk:          { x: 300, y: 800 },
    poss_def_atk:         { x: 300, y: 680 },
    poss_mid_atk:         { x: 200, y: 450 },
    poss_str_atk:         { x: 300, y: 250 },
    shot_on_atk:          { x: 220, y: 120 },
    shot_off_atk:         { x: 380, y: 120 },
    goal_atk:             { x: 300, y: 40  },
    poss_def_def:         { x: 480, y: 280 },
    poss_mid_def:         { x: 480, y: 450 },
    poss_gk_def:          { x: 480, y: 750 },
    save_def:             { x: 180, y: 830 },
    dead_goalkick_def:    { x: 420, y: 830 },
    dead_corner_atk:      { x: 80,  y: 80  },
    dead_throwin_atk:     { x: 80,  y: 450 },
    dead_foul_atk:        { x: 80,  y: 280 },
  };

  const CATEGORY_MAP = {
    kickoff:           'match flow',
    poss_gk_atk:       'atk possession',
    poss_def_atk:      'atk possession',
    poss_mid_atk:      'atk possession',
    poss_str_atk:      'atk possession',
    shot_on_atk:       'shots/goals',
    shot_off_atk:      'shots/goals',
    goal_atk:          'shots/goals',
    poss_def_def:       'def swap',
    poss_mid_def:       'def swap',
    poss_gk_def:        'def swap',
    save_def:           'saves/GK',
    dead_goalkick_def:  'saves/GK',
    dead_corner_atk:    'set pieces',
    dead_throwin_atk:   'set pieces',
    dead_foul_atk:      'set pieces',
  };

  const CATEGORY_COLORS = {
    'match flow':      '#fff',
    'atk possession':  '#3a3',
    'def swap':        '#c44',
    'shots/goals':     '#da2',
    'saves/GK':        '#38c',
    'set pieces':      '#a3a',
  };

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const LS_KEY = 'markov-editor-positions';

  // Human-readable names for states
  const FRIENDLY_NAMES = {
    kickoff:           'Kickoff',
    poss_gk_atk:       'Your goalkeeper has the ball',
    poss_def_atk:      'Your defender has the ball',
    poss_mid_atk:      'Your midfielder has the ball',
    poss_str_atk:      'Your striker has the ball',
    shot_on_atk:       'Shot on target',
    shot_off_atk:      'Shot off target (missed)',
    goal_atk:          'GOAL!',
    poss_def_def:      'Opponent defender wins the ball',
    poss_mid_def:      'Opponent midfielder wins the ball',
    poss_gk_def:       'Opponent goalkeeper has the ball',
    save_def:          'Opponent keeper makes a save',
    dead_goalkick_def: 'Goal kick (opponent)',
    dead_corner_atk:   'Corner kick (yours)',
    dead_throwin_atk:  'Throw-in (yours)',
    dead_foul_atk:     'Foul (free kick for you)',
  };

  function friendly(state) {
    return FRIENDLY_NAMES[state] || state;
  }

  // ===== State =====
  let transitions = {};   // deep copy of MARKOV_TRANSITIONS
  let influences = {};    // deep copy of STAT_INFLUENCES
  let nodePositions = {}; // { state: {x, y} }
  let nodeCategories = {};

  let selectedNode = null;
  let selectedEdge = null; // { contextKey, target }
  let currentFilter = '*'; // context filter value
  let addEdgeMode = false;
  let addEdgeSource = null;
  let addStateMode = false;
  let showInfluences = false;

  // DOM refs
  const svg = document.getElementById('pitch');
  const edgesLayer = document.getElementById('edges-layer');
  const nodesLayer = document.getElementById('nodes-layer');
  const contextFilter = document.getElementById('context-filter');
  const modeIndicator = document.getElementById('mode-indicator');

  // ===== Initialization =====
  function init() {
    // Deep-copy data from data.js globals
    transitions = JSON.parse(JSON.stringify(
      typeof MARKOV_TRANSITIONS !== 'undefined' ? MARKOV_TRANSITIONS : {}
    ));
    influences = JSON.parse(JSON.stringify(
      typeof STAT_INFLUENCES !== 'undefined' ? STAT_INFLUENCES : {}
    ));

    // Build node list from all states mentioned in transitions
    const allStates = new Set();
    for (const key of Object.keys(transitions)) {
      const [prev, cur] = key.split('|');
      if (prev !== '*') allStates.add(prev);
      allStates.add(cur);
      for (const tgt of Object.keys(transitions[key])) {
        allStates.add(tgt);
      }
    }

    // Load positions from localStorage or defaults
    const saved = localStorage.getItem(LS_KEY);
    const savedPos = saved ? JSON.parse(saved) : {};
    for (const s of allStates) {
      nodePositions[s] = savedPos[s] || DEFAULT_POSITIONS[s] || { x: 300, y: 450 };
      nodeCategories[s] = CATEGORY_MAP[s] || 'match flow';
    }

    // Create tooltip element
    const tooltip = document.createElement('div');
    tooltip.id = 'edge-tooltip';
    document.getElementById('canvas-wrap').appendChild(tooltip);

    buildContextFilter();
    render();
    bindToolbar();
    bindKeyboard();
    showPanel('overview');
    updateOverview();
  }

  // ===== Context filter =====
  function buildContextFilter() {
    const keys = Object.keys(transitions);
    const states = Object.keys(nodePositions).sort();

    contextFilter.innerHTML = '';
    addOption('*', 'Default probabilities');

    // Gather all unique context keys
    const secondOrder = keys.filter(k => !k.startsWith('*|')).sort();
    if (secondOrder.length) {
      const group = document.createElement('optgroup');
      group.label = 'Situation-specific rules';
      for (const k of secondOrder) {
        const [prev, cur] = k.split('|');
        const opt = document.createElement('option');
        opt.value = k;
        opt.textContent = friendly(prev) + ' → ' + friendly(cur);
        group.appendChild(opt);
      }
      contextFilter.appendChild(group);
    }

    // "All for state: X"
    const stateGroup = document.createElement('optgroup');
    stateGroup.label = 'Everything for one state...';
    for (const s of states) {
      const opt = document.createElement('option');
      opt.value = 'state:' + s;
      opt.textContent = 'All for: ' + friendly(s);
      stateGroup.appendChild(opt);
    }
    contextFilter.appendChild(stateGroup);

    addOption('everything', 'Everything (all arrows)');

    contextFilter.value = '*';

    function addOption(val, text) {
      const opt = document.createElement('option');
      opt.value = val;
      opt.textContent = text;
      contextFilter.appendChild(opt);
    }
  }

  // ===== Determine which transition keys to show =====
  function getVisibleKeys() {
    const filter = currentFilter;
    const keys = Object.keys(transitions);
    if (filter === '*') return keys.filter(k => k.startsWith('*|'));
    if (filter === 'everything') return keys;
    if (filter.startsWith('state:')) {
      const state = filter.slice(6);
      return keys.filter(k => k.split('|')[1] === state);
    }
    // Specific second-order key
    return keys.filter(k => k === filter);
  }

  // ===== Rendering =====
  function render() {
    renderEdges();
    renderNodes();
  }

  function renderNodes() {
    nodesLayer.innerHTML = '';
    for (const [state, pos] of Object.entries(nodePositions)) {
      const cat = nodeCategories[state] || 'match flow';
      const color = CATEGORY_COLORS[cat] || '#fff';

      const g = createSVG('g', { class: 'node-group', 'data-state': state });

      const circle = createSVG('circle', {
        cx: pos.x, cy: pos.y, r: 24,
        fill: color,
        'fill-opacity': 0.25,
        stroke: color,
        class: 'node-circle' + (selectedNode === state ? ' selected' : ''),
      });

      // Abbreviate label
      const label = createSVG('text', {
        x: pos.x, y: pos.y + 3,
        class: 'node-label',
      });
      label.textContent = abbreviate(state);

      g.appendChild(circle);
      g.appendChild(label);
      nodesLayer.appendChild(g);

      // Drag & click
      let dragging = false;
      let dragStart = null;

      circle.addEventListener('mousedown', (e) => {
        if (addEdgeMode) return; // handled by click
        dragging = false;
        dragStart = svgPoint(e);
        const onMove = (me) => {
          dragging = true;
          const pt = svgPoint(me);
          nodePositions[state] = { x: Math.round(pt.x), y: Math.round(pt.y) };
          savePositions();
          render();
        };
        const onUp = () => {
          svg.removeEventListener('mousemove', onMove);
          svg.removeEventListener('mouseup', onUp);
          if (!dragging) handleNodeClick(state);
        };
        svg.addEventListener('mousemove', onMove);
        svg.addEventListener('mouseup', onUp);
        e.preventDefault();
      });

      circle.addEventListener('click', (e) => {
        if (addEdgeMode) {
          handleAddEdgeClick(state);
          e.stopPropagation();
        }
      });
    }
  }

  function renderEdges() {
    edgesLayer.innerHTML = '';
    const visibleKeys = getVisibleKeys();
    const isEverything = currentFilter === 'everything';
    const tooltip = document.getElementById('edge-tooltip');

    // Collect all edges to render and count edges between same pair for offset
    const edgeIndex = {}; // "src|tgt" -> count

    for (const key of visibleKeys) {
      const [, current] = key.split('|');
      const dist = transitions[key];
      if (!dist) continue;

      for (const [target, prob] of Object.entries(dist)) {
        if (!nodePositions[current] || !nodePositions[target]) continue;
        const pairKey = current < target ? current + '|' + target : target + '|' + current;
        if (!edgeIndex[pairKey]) edgeIndex[pairKey] = [];
        edgeIndex[pairKey].push({ key, current, target, prob });
      }
    }

    // Render each edge
    for (const edges of Object.values(edgeIndex)) {
      const total = edges.length;
      edges.forEach((edge, i) => {
        const { key, current, target, prob } = edge;
        const src = nodePositions[current];
        const tgt = nodePositions[target];
        const cat = nodeCategories[target] || 'match flow';
        const color = CATEGORY_COLORS[cat] || '#fff';
        const thickness = 1 + prob * 8;
        const baseOpacity = isEverything ? 0.2 : 0.4;
        const isSel = selectedEdge && selectedEdge.contextKey === key && selectedEdge.target === target;

        // Influence key for this edge
        const inflKey = current + '|' + target;
        const hasInfluence = influences[inflKey];

        let pathD;
        if (current === target) {
          // Self-loop
          pathD = `M${src.x - 15},${src.y - 20} A20,20 0 1,1 ${src.x + 15},${src.y - 20}`;
        } else {
          // Bezier with offset for multiple edges between same pair
          const offset = (i - (total - 1) / 2) * 18;
          pathD = bezierPath(src, tgt, offset);
        }

        const arrowId = 'arrow-' + categoryToArrow(cat);

        // Hit target (wide invisible path)
        const hit = createSVG('path', {
          d: pathD,
          class: 'edge-hit',
          'data-key': key,
          'data-target': target,
        });

        // Visible path
        const path = createSVG('path', {
          d: pathD,
          stroke: color,
          'stroke-width': thickness,
          opacity: isSel ? 0.95 : baseOpacity,
          'marker-end': `url(#${arrowId})`,
          class: 'edge-path' + (isSel ? ' selected' : ''),
          'data-key': key,
          'data-target': target,
        });

        edgesLayer.appendChild(path);

        // Influence dash overlay
        if (hasInfluence && showInfluences) {
          const dash = createSVG('path', {
            d: pathD,
            stroke: '#fff',
            'stroke-width': Math.max(thickness * 0.6, 1),
            class: 'edge-influence-dash',
          });
          edgesLayer.appendChild(dash);
        }

        edgesLayer.appendChild(hit);

        // Hover
        hit.addEventListener('mouseenter', (e) => {
          path.setAttribute('opacity', '0.9');
          const pct = (prob * 100).toFixed(1);
          let text = `${friendly(current)} → ${friendly(target)}\n${pct}% chance`;
          if (hasInfluence) {
            const inf = influences[inflKey];
            if (inf.boost) text += `\nBoosted by: ${inf.boost.stat} (${inf.boost.role})`;
            if (inf.resist) text += `\nResisted by: ${inf.resist.stat} (${inf.resist.role})`;
          }
          tooltip.textContent = text;
          tooltip.style.display = 'block';
        });

        hit.addEventListener('mousemove', (e) => {
          const wrap = document.getElementById('canvas-wrap');
          const rect = wrap.getBoundingClientRect();
          tooltip.style.left = (e.clientX - rect.left + 12) + 'px';
          tooltip.style.top = (e.clientY - rect.top - 10) + 'px';
        });

        hit.addEventListener('mouseleave', () => {
          if (!isSel) path.setAttribute('opacity', String(baseOpacity));
          tooltip.style.display = 'none';
        });

        hit.addEventListener('click', (e) => {
          handleEdgeClick(key, target);
          e.stopPropagation();
        });
      });
    }
  }

  function bezierPath(src, tgt, offset) {
    const dx = tgt.x - src.x;
    const dy = tgt.y - src.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    // Perpendicular unit vector
    const px = -dy / len;
    const py = dx / len;
    // Control point at midpoint offset perpendicular
    const mx = (src.x + tgt.x) / 2 + px * offset;
    const my = (src.y + tgt.y) / 2 + py * offset;
    // Shorten start/end to not overlap node circles
    const r = 26; // slightly larger than node radius
    const startX = src.x + (dx / len) * r;
    const startY = src.y + (dy / len) * r;
    const endX = tgt.x - (dx / len) * r;
    const endY = tgt.y - (dy / len) * r;
    return `M${startX},${startY} Q${mx},${my} ${endX},${endY}`;
  }

  // ===== Selection handlers =====
  let firstSelectedNode = null; // for two-click pair selection

  function handleNodeClick(state) {
    if (addStateMode) return;
    selectedEdge = null;

    if (firstSelectedNode && firstSelectedNode !== state) {
      // Second click — look for a context key "firstNode|secondNode"
      const pairKey = firstSelectedNode + '|' + state;
      if (transitions[pairKey]) {
        // Show this specific second-order context
        currentFilter = pairKey;
        contextFilter.value = pairKey;
        selectedNode = state;
        firstSelectedNode = null;
        modeIndicator.textContent = '';
        showPanel('node');
        renderNodePanel(state);
        render();
        return;
      }
      // No specific context for this pair — show wildcards for the second node
      currentFilter = 'state:' + state;
      contextFilter.value = 'state:' + state;
      firstSelectedNode = null;
      modeIndicator.textContent = '';
    } else {
      // First click — select this node, show its wildcards, prompt for second
      firstSelectedNode = state;
      currentFilter = 'state:' + state;
      contextFilter.value = 'state:' + state;
      modeIndicator.textContent = 'Click another circle to see how these two connect';
    }

    selectedNode = state;
    showPanel('node');
    renderNodePanel(state);
    render();
  }

  function handleEdgeClick(contextKey, target) {
    selectedEdge = { contextKey, target };
    selectedNode = null;
    showPanel('edge');
    renderEdgePanel(contextKey, target);
    render();
  }

  function clearSelection() {
    selectedNode = null;
    selectedEdge = null;
    firstSelectedNode = null;
    addEdgeMode = false;
    addEdgeSource = null;
    addStateMode = false;
    currentFilter = '*';
    contextFilter.value = '*';
    modeIndicator.textContent = '';
    document.getElementById('btn-add-edge').classList.remove('active-mode');
    document.getElementById('btn-add-state').classList.remove('active-mode');
    showPanel('overview');
    render();
  }

  // ===== Panels =====
  function showPanel(name) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    const panel = document.getElementById('panel-' + name);
    if (panel) panel.classList.add('active');
  }

  function updateOverview() {
    const states = Object.keys(nodePositions).length;
    const keys = Object.keys(transitions).length;
    const wildcards = Object.keys(transitions).filter(k => k.startsWith('*|')).length;
    const secondOrder = keys - wildcards;
    const infCount = Object.keys(influences).length;
    document.getElementById('overview-stats').innerHTML =
      `<div style="margin-top:12px; padding:10px; background:#0f3460; border-radius:6px; line-height:2">` +
      `<b>${states}</b> game states (circles on the pitch)<br>` +
      `<b>${keys}</b> transition rules — <b>${wildcards}</b> defaults + <b>${secondOrder}</b> situation-specific<br>` +
      `<b>${infCount}</b> player stat effects</div>`;
  }

  function renderNodePanel(state) {
    document.getElementById('node-name').textContent = friendly(state);
    const cat = nodeCategories[state] || 'match flow';
    document.getElementById('node-category').innerHTML =
      `<span style="color:${CATEGORY_COLORS[cat]}">● ${cat}</span> <span style="color:#666; font-size:12px">(${state})</span>`;

    document.getElementById('node-description').textContent =
      `This is the "${state}" state. The arrows below show what can happen next, and how likely each outcome is.`;

    // Pair hint
    const hintEl = document.getElementById('node-pair-hint');
    if (firstSelectedNode === state) {
      hintEl.textContent = 'Now click another circle to see how they connect.';
    } else {
      hintEl.textContent = '';
    }

    // Outgoing distributions grouped by context
    const outgoing = document.getElementById('node-outgoing');
    outgoing.innerHTML = '';
    const keys = Object.keys(transitions).filter(k => k.split('|')[1] === state).sort();
    if (keys.length === 0) {
      outgoing.innerHTML = '<i style="color:#666">No outgoing transitions defined</i>';
    }
    for (const key of keys) {
      const [prev] = key.split('|');
      const div = document.createElement('div');
      div.className = 'context-group';
      const header = document.createElement('div');
      header.className = 'context-group-header';
      if (prev === '*') {
        header.textContent = 'Default (any previous state)';
      } else {
        header.textContent = 'After: ' + friendly(prev);
      }
      header.title = key;
      header.addEventListener('click', () => {
        contextFilter.value = key.startsWith('*|') ? '*' : key;
        currentFilter = contextFilter.value;
        render();
      });
      div.appendChild(header);

      const dist = transitions[key];
      for (const [tgt, prob] of Object.entries(dist)) {
        const pct = (prob * 100).toFixed(1);
        const row = document.createElement('div');
        row.className = 'dist-row';
        row.innerHTML = `<span class="target-name" title="${tgt}">${friendly(tgt)}</span><span>${pct}%</span>`;
        row.style.cursor = 'pointer';
        row.addEventListener('click', () => handleEdgeClick(key, tgt));
        div.appendChild(row);
      }
      outgoing.appendChild(div);
    }

    // Incoming edges
    const incoming = document.getElementById('node-incoming');
    incoming.innerHTML = '';
    for (const key of Object.keys(transitions)) {
      const dist = transitions[key];
      if (dist[state] !== undefined) {
        const [prev, cur] = key.split('|');
        const pct = (dist[state] * 100).toFixed(1);
        const label = prev === '*'
          ? `From ${friendly(cur)} (default) — ${pct}%`
          : `From ${friendly(cur)} after ${friendly(prev)} — ${pct}%`;
        const item = document.createElement('div');
        item.className = 'incoming-item';
        item.textContent = label;
        item.title = key;
        item.addEventListener('click', () => handleEdgeClick(key, state));
        incoming.appendChild(item);
      }
    }
    if (!incoming.children.length) {
      incoming.innerHTML = '<i style="color:#666">Nothing leads here</i>';
    }

    // Delete node handler
    document.getElementById('btn-delete-node').onclick = () => {
      if (!confirm(`Delete "${friendly(state)}"? This will remove all transitions referencing it.`)) return;
      deleteState(state);
      clearSelection();
      updateOverview();
    };
  }

  function renderEdgePanel(contextKey, target) {
    const [prev, current] = contextKey.split('|');
    const titleEl = document.getElementById('edge-title');
    titleEl.textContent = friendly(current) + ' →';

    const descEl = document.getElementById('edge-context-description');
    if (prev === '*') {
      descEl.innerHTML = `When <b>${friendly(current)}</b> happens (default probabilities). ` +
        `<span style="color:#666; font-size:11px">${contextKey}</span>`;
    } else {
      descEl.innerHTML = `When <b>${friendly(current)}</b> happens right after <b>${friendly(prev)}</b>. ` +
        `<span style="color:#666; font-size:11px">${contextKey}</span>`;
    }

    // Full distribution for this context key
    const dist = transitions[contextKey];
    const rowsDiv = document.getElementById('edge-dist-rows');
    rowsDiv.innerHTML = '';

    const targets = Object.keys(dist).sort();
    for (const tgt of targets) {
      const row = document.createElement('div');
      row.className = 'dist-row';
      const nameSpan = document.createElement('span');
      nameSpan.className = 'target-name';
      nameSpan.textContent = friendly(tgt);
      nameSpan.title = tgt;
      nameSpan.style.fontWeight = tgt === target ? '700' : '400';

      const input = document.createElement('input');
      input.type = 'number';
      input.step = '0.01';
      input.min = '0';
      input.max = '1';
      input.value = dist[tgt].toFixed(3);
      input.addEventListener('input', () => {
        dist[tgt] = parseFloat(input.value) || 0;
        updateSumBar(contextKey);
        render();
      });

      // Influence badge
      const inflKey = current + '|' + tgt;
      let badges = '';
      if (influences[inflKey]) {
        const inf = influences[inflKey];
        if (inf.boost) badges += `<span class="influence-badge boost">↑${inf.boost.stat}</span>`;
        if (inf.resist) badges += `<span class="influence-badge resist">↓${inf.resist.stat}</span>`;
      }

      row.appendChild(nameSpan);
      if (badges) { const b = document.createElement('span'); b.innerHTML = badges; row.appendChild(b); }
      row.appendChild(input);

      const delBtn = document.createElement('button');
      delBtn.textContent = '×';
      delBtn.style.cssText = 'background:none;border:none;color:#f77;cursor:pointer;font-size:14px;padding:0 4px;';
      delBtn.addEventListener('click', () => {
        delete dist[tgt];
        if (Object.keys(dist).length === 0) delete transitions[contextKey];
        renderEdgePanel(contextKey, target);
        buildContextFilter();
        render();
        updateOverview();
      });
      row.appendChild(delBtn);
      rowsDiv.appendChild(row);
    }

    // Add target row
    const addRow = document.createElement('div');
    addRow.className = 'dist-row';
    const addSelect = document.createElement('select');
    addSelect.innerHTML = '<option value="">+ Add another outcome…</option>';
    for (const s of Object.keys(nodePositions).sort()) {
      if (!dist[s]) {
        addSelect.innerHTML += `<option value="${s}">${friendly(s)}</option>`;
      }
    }
    addSelect.addEventListener('change', () => {
      if (addSelect.value) {
        dist[addSelect.value] = 0;
        renderEdgePanel(contextKey, target);
        render();
      }
    });
    addRow.appendChild(addSelect);
    rowsDiv.appendChild(addRow);

    updateSumBar(contextKey);

    // Normalize button
    document.getElementById('btn-normalize').onclick = () => {
      normalize(contextKey);
      renderEdgePanel(contextKey, target);
      render();
    };

    // Stat influence section
    const inflSection = document.getElementById('edge-influence-detail');
    const inflKey = current + '|' + target;
    inflSection.innerHTML = '';

    const inf = influences[inflKey] || {};
    for (const type of ['boost', 'resist']) {
      const entry = inf[type];
      const div = document.createElement('div');
      div.className = 'influence-entry';
      div.innerHTML = `<b>${type === 'boost' ? '↑ Boost' : '↓ Resist'}:</b> `;
      if (entry) {
        const statSel = document.createElement('select');
        for (const s of (typeof STATS !== 'undefined' ? STATS : [])) {
          statSel.innerHTML += `<option value="${s}" ${s === entry.stat ? 'selected' : ''}>${s}</option>`;
        }
        statSel.addEventListener('change', () => { entry.stat = statSel.value; });

        const roleInput = document.createElement('input');
        roleInput.type = 'text';
        roleInput.value = entry.role;
        roleInput.style.width = '80px';
        roleInput.addEventListener('input', () => { entry.role = roleInput.value; });

        const weightInput = document.createElement('input');
        weightInput.type = 'number';
        weightInput.step = '0.01';
        weightInput.value = entry.weight;
        weightInput.style.width = '55px';
        weightInput.addEventListener('input', () => { entry.weight = parseFloat(weightInput.value) || 0; });

        const removeBtn = document.createElement('button');
        removeBtn.textContent = '×';
        removeBtn.style.cssText = 'background:none;border:none;color:#f77;cursor:pointer;margin-left:6px;';
        removeBtn.addEventListener('click', () => {
          delete inf[type];
          if (!inf.boost && !inf.resist) delete influences[inflKey];
          renderEdgePanel(contextKey, target);
        });

        div.appendChild(statSel);
        div.appendChild(document.createTextNode(' role: '));
        div.appendChild(roleInput);
        div.appendChild(document.createTextNode(' w: '));
        div.appendChild(weightInput);
        div.appendChild(removeBtn);
      } else {
        const addBtn = document.createElement('button');
        addBtn.textContent = `Add ${type}`;
        addBtn.style.cssText = 'background:#0f3460;color:#e0e0e0;border:1px solid #1a3a6a;padding:2px 8px;border-radius:3px;cursor:pointer;font-size:11px;';
        addBtn.addEventListener('click', () => {
          if (!influences[inflKey]) influences[inflKey] = {};
          influences[inflKey][type] = { stat: 'passing', role: 'mid_atk', weight: 0.10 };
          renderEdgePanel(contextKey, target);
        });
        div.appendChild(addBtn);
      }
      inflSection.appendChild(div);
    }

    // Delete edge
    document.getElementById('btn-delete-edge').onclick = () => {
      if (dist[target] !== undefined) {
        delete dist[target];
        if (Object.keys(dist).length === 0) delete transitions[contextKey];
      }
      clearSelection();
      buildContextFilter();
      updateOverview();
    };
  }

  function updateSumBar(contextKey) {
    const dist = transitions[contextKey];
    if (!dist) return;
    const sum = Object.values(dist).reduce((a, b) => a + b, 0);
    const bar = document.getElementById('edge-sum-bar');
    const valid = Math.abs(sum - 1.0) < 0.005;
    bar.className = 'sum-bar ' + (valid ? 'valid' : 'invalid');
    bar.textContent = `Sum: ${sum.toFixed(4)}` + (valid ? ' ✓' : ' ≠ 1.00');
  }

  // ===== Editing operations =====
  function normalize(contextKey) {
    const dist = transitions[contextKey];
    if (!dist) return;
    const sum = Object.values(dist).reduce((a, b) => a + b, 0);
    if (sum === 0) return;
    for (const k of Object.keys(dist)) {
      dist[k] = Math.round((dist[k] / sum) * 1000) / 1000;
    }
    // Fix rounding to exactly 1.0
    const newSum = Object.values(dist).reduce((a, b) => a + b, 0);
    const keys = Object.keys(dist);
    if (keys.length && Math.abs(newSum - 1.0) > 0.0001) {
      dist[keys[0]] += Math.round((1.0 - newSum) * 1000) / 1000;
    }
  }

  function deleteState(state) {
    delete nodePositions[state];
    delete nodeCategories[state];
    // Remove all transition keys involving this state
    for (const key of Object.keys(transitions)) {
      const [prev, cur] = key.split('|');
      if (cur === state || prev === state) {
        delete transitions[key];
        continue;
      }
      const dist = transitions[key];
      delete dist[state];
      if (Object.keys(dist).length === 0) delete transitions[key];
    }
    // Remove influences involving this state
    for (const key of Object.keys(influences)) {
      const [a, b] = key.split('|');
      if (a === state || b === state) delete influences[key];
    }
    savePositions();
    buildContextFilter();
  }

  // ===== Add Edge mode =====
  function handleAddEdgeClick(state) {
    if (!addEdgeSource) {
      addEdgeSource = state;
      modeIndicator.textContent = `Add Edge: ${state} → click target...`;
    } else {
      const source = addEdgeSource;
      const target = state;
      // Create wildcard fallback entry if none exists
      const contextKey = '*|' + source;
      if (!transitions[contextKey]) transitions[contextKey] = {};
      if (transitions[contextKey][target] === undefined) {
        transitions[contextKey][target] = 0;
      }
      addEdgeMode = false;
      addEdgeSource = null;
      document.getElementById('btn-add-edge').classList.remove('active-mode');
      modeIndicator.textContent = '';
      buildContextFilter();
      handleEdgeClick(contextKey, target);
      updateOverview();
    }
  }

  // ===== Add State mode =====
  function startAddStateMode() {
    addStateMode = true;
    addEdgeMode = false;
    showPanel('add-state');
    document.getElementById('btn-add-state').classList.add('active-mode');
    document.getElementById('btn-add-edge').classList.remove('active-mode');
    modeIndicator.textContent = 'Click on pitch to place new state';

    const handler = (e) => {
      if (!addStateMode) return;
      const name = document.getElementById('new-state-name').value.trim();
      if (!name) { alert('Enter a state name first.'); return; }
      if (nodePositions[name]) { alert('State already exists.'); return; }

      const pt = svgPoint(e);
      nodePositions[name] = { x: Math.round(pt.x), y: Math.round(pt.y) };
      nodeCategories[name] = document.getElementById('new-state-cat').value;
      savePositions();

      addStateMode = false;
      document.getElementById('btn-add-state').classList.remove('active-mode');
      modeIndicator.textContent = '';
      svg.removeEventListener('click', handler);

      buildContextFilter();
      render();
      handleNodeClick(name);
      updateOverview();
    };
    svg.addEventListener('click', handler);
  }

  // ===== Import/Export =====
  function doImport() {
    const tText = document.getElementById('import-transitions').value.trim();
    const iText = document.getElementById('import-influences').value.trim();
    const errEl = document.getElementById('import-error');
    errEl.textContent = '';

    try {
      if (tText) {
        const parsed = (new Function('return ' + tText))();
        if (typeof parsed !== 'object') throw new Error('MARKOV_TRANSITIONS must be an object');
        transitions = JSON.parse(JSON.stringify(parsed));
      }
      if (iText) {
        const parsed = (new Function('return ' + iText))();
        if (typeof parsed !== 'object') throw new Error('STAT_INFLUENCES must be an object');
        influences = JSON.parse(JSON.stringify(parsed));
      }

      // Rebuild nodes from imported transitions
      const allStates = new Set();
      for (const key of Object.keys(transitions)) {
        const [prev, cur] = key.split('|');
        if (prev !== '*') allStates.add(prev);
        allStates.add(cur);
        for (const tgt of Object.keys(transitions[key])) allStates.add(tgt);
      }
      for (const s of allStates) {
        if (!nodePositions[s]) {
          nodePositions[s] = DEFAULT_POSITIONS[s] || { x: 300, y: 450 };
          nodeCategories[s] = CATEGORY_MAP[s] || 'match flow';
        }
      }

      document.getElementById('import-modal').classList.add('hidden');
      clearSelection();
      buildContextFilter();
      updateOverview();
    } catch (err) {
      errEl.textContent = 'Parse error: ' + err.message;
    }
  }

  function doExport() {
    // Sort keys: second-order first, then wildcards
    const keys = Object.keys(transitions).sort((a, b) => {
      const aWild = a.startsWith('*|');
      const bWild = b.startsWith('*|');
      if (aWild !== bWild) return aWild ? 1 : -1;
      return a.localeCompare(b);
    });

    let tCode = 'const MARKOV_TRANSITIONS = {\n';
    let inWildcards = false;
    for (const key of keys) {
      if (!inWildcards && key.startsWith('*|')) {
        inWildcards = true;
        tCode += '\n  // ===== WILDCARD FALLBACKS =====\n';
      }
      const dist = transitions[key];
      const entries = Object.entries(dist).map(([k, v]) => `${k}: ${v}`).join(', ');
      const padded = (`'${key}'`).padEnd(38);
      tCode += `  ${padded}{ ${entries} },\n`;
    }
    tCode += '};\n';

    let iCode = 'const STAT_INFLUENCES = {\n';
    for (const key of Object.keys(influences).sort()) {
      const inf = influences[key];
      const parts = [];
      if (inf.boost) parts.push(`boost: { stat: '${inf.boost.stat}', role: '${inf.boost.role}', weight: ${inf.boost.weight} }`);
      if (inf.resist) parts.push(`resist: { stat: '${inf.resist.stat}', role: '${inf.resist.role}', weight: ${inf.resist.weight} }`);
      iCode += `  '${key}': { ${parts.join(', ')} },\n`;
    }
    iCode += '};\n';

    document.getElementById('export-transitions').value = tCode;
    document.getElementById('export-influences').value = iCode;
    document.getElementById('export-modal').classList.remove('hidden');
  }

  function validate() {
    const issues = [];
    for (const key of Object.keys(transitions)) {
      const dist = transitions[key];
      const sum = Object.values(dist).reduce((a, b) => a + b, 0);
      if (Math.abs(sum - 1.0) > 0.005) {
        issues.push(`${key}: sum = ${sum.toFixed(4)}`);
      }
      // Check targets exist
      for (const tgt of Object.keys(dist)) {
        if (!nodePositions[tgt]) issues.push(`${key}: target "${tgt}" is not a known state`);
      }
    }
    // Check influence keys reference valid transitions
    for (const key of Object.keys(influences)) {
      const [cur, next] = key.split('|');
      if (!nodePositions[cur]) issues.push(`Influence "${key}": state "${cur}" not found`);
      if (!nodePositions[next]) issues.push(`Influence "${key}": state "${next}" not found`);
    }
    if (issues.length === 0) {
      alert('All validations passed! ✓');
    } else {
      alert('Validation issues:\n\n' + issues.join('\n'));
    }
  }

  // ===== Toolbar bindings =====
  function bindToolbar() {
    contextFilter.addEventListener('change', () => {
      currentFilter = contextFilter.value;
      render();
    });

    document.getElementById('btn-add-state').addEventListener('click', () => {
      if (addStateMode) {
        addStateMode = false;
        document.getElementById('btn-add-state').classList.remove('active-mode');
        modeIndicator.textContent = '';
        showPanel('overview');
        return;
      }
      startAddStateMode();
    });

    document.getElementById('btn-add-edge').addEventListener('click', () => {
      if (addEdgeMode) {
        addEdgeMode = false;
        addEdgeSource = null;
        document.getElementById('btn-add-edge').classList.remove('active-mode');
        modeIndicator.textContent = '';
        return;
      }
      addEdgeMode = true;
      addEdgeSource = null;
      addStateMode = false;
      document.getElementById('btn-add-edge').classList.add('active-mode');
      document.getElementById('btn-add-state').classList.remove('active-mode');
      modeIndicator.textContent = 'Click source node...';
    });

    document.getElementById('toggle-influences').addEventListener('change', (e) => {
      showInfluences = e.target.checked;
      render();
    });

    document.getElementById('btn-import').addEventListener('click', () => {
      document.getElementById('import-modal').classList.remove('hidden');
    });
    document.getElementById('btn-import-apply').addEventListener('click', doImport);
    document.getElementById('btn-import-cancel').addEventListener('click', () => {
      document.getElementById('import-modal').classList.add('hidden');
    });

    document.getElementById('btn-export').addEventListener('click', doExport);
    document.getElementById('btn-export-close').addEventListener('click', () => {
      document.getElementById('export-modal').classList.add('hidden');
    });

    document.getElementById('btn-copy-transitions').addEventListener('click', () => {
      navigator.clipboard.writeText(document.getElementById('export-transitions').value);
    });
    document.getElementById('btn-copy-influences').addEventListener('click', () => {
      navigator.clipboard.writeText(document.getElementById('export-influences').value);
    });

    document.getElementById('btn-validate').addEventListener('click', validate);

    document.getElementById('btn-cancel-add-state').addEventListener('click', () => {
      addStateMode = false;
      document.getElementById('btn-add-state').classList.remove('active-mode');
      modeIndicator.textContent = '';
      showPanel('overview');
    });

    // Click on empty pitch area deselects
    svg.addEventListener('click', (e) => {
      if (e.target === svg || e.target.tagName === 'rect' || e.target.tagName === 'line' || e.target.tagName === 'circle' && e.target.getAttribute('cx') === '300') {
        if (!addStateMode && !addEdgeMode) clearSelection();
      }
    });
  }

  // ===== Keyboard shortcuts =====
  function bindKeyboard() {
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

      if (e.key === 'Escape') {
        clearSelection();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNode) {
          if (confirm(`Delete state "${selectedNode}"?`)) {
            deleteState(selectedNode);
            clearSelection();
            updateOverview();
          }
        } else if (selectedEdge) {
          const dist = transitions[selectedEdge.contextKey];
          if (dist) {
            delete dist[selectedEdge.target];
            if (Object.keys(dist).length === 0) delete transitions[selectedEdge.contextKey];
          }
          clearSelection();
          buildContextFilter();
          updateOverview();
        }
      } else if (e.key === 'n' || e.key === 'N') {
        if (selectedEdge) {
          normalize(selectedEdge.contextKey);
          renderEdgePanel(selectedEdge.contextKey, selectedEdge.target);
          render();
        }
      } else if (e.key === '?') {
        showTutorial();
      }
    });
  }

  // ===== Helpers =====
  function createSVG(tag, attrs) {
    const el = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs)) {
      el.setAttribute(k, String(v));
    }
    return el;
  }

  function svgPoint(e) {
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }

  function savePositions() {
    localStorage.setItem(LS_KEY, JSON.stringify(nodePositions));
  }

  function abbreviate(state) {
    // Shorten for display: poss_mid_atk → mid_atk, dead_corner_atk → corner
    return state
      .replace(/^poss_/, '')
      .replace(/^dead_/, '')
      .replace(/^shot_/, 'sh_');
  }

  function categoryToArrow(cat) {
    if (cat === 'atk possession') return 'green';
    if (cat === 'shots/goals') return 'gold';
    if (cat === 'def swap') return 'red';
    if (cat === 'set pieces') return 'purple';
    if (cat === 'saves/GK') return 'blue';
    return 'green';
  }

  // ===== Tutorial =====
  const TUTORIAL_STEPS = [
    {
      title: 'Welcome!',
      body: `<p>This is a visual editor for the match engine — the system that decides what happens during a simulated soccer game.</p>
<p>Every match is a series of "moments" — the ball is in midfield, a striker takes a shot, the keeper makes a save. This graph shows how the game flows from one moment to the next, and how likely each transition is.</p>
<p>The pitch on the left is oriented vertically — your team attacks <b>upward</b> toward the top goal.</p>`
    },
    {
      title: 'What are the circles?',
      body: `<p>Each circle on the pitch represents a <b>game state</b> — a moment in the match. For example, "mid_atk" means your midfielder has the ball, and "shot_on" means someone just took a shot on target.</p>
<p>The circles are color-coded by type:</p>
<p style="line-height:2.2">
<span style="color:#3a3">&#9679; Green</span> — your team has the ball (attacking possession)<br>
<span style="color:#c44">&#9679; Red</span> — the other team has the ball (possession lost)<br>
<span style="color:#da2">&#9679; Gold</span> — shots and goals<br>
<span style="color:#38c">&#9679; Blue</span> — goalkeeper actions (saves, goal kicks)<br>
<span style="color:#a3a">&#9679; Purple</span> — set pieces (corners, throw-ins, fouls)<br>
<span style="color:#fff">&#9679; White</span> — kickoff</p>`
    },
    {
      title: 'What are the arrows?',
      body: `<p>The arrows between circles show what can happen next, and how likely it is. A <b>thicker arrow</b> means that transition happens more often.</p>
<p>For example, a thick green arrow from "mid_atk" to "str_atk" means your midfielder frequently passes forward to the striker. A thin arrow means it's rare.</p>
<p>Hover over any arrow to see the exact probability and which player stats affect it.</p>`
    },
    {
      title: 'The Context Filter',
      body: `<p>Here's the clever bit — the probabilities change depending on <b>what just happened</b>. A striker who received the ball from a counter-attack is more likely to shoot than one who got it from a slow build-up.</p>
<p>The <b>Context dropdown</b> at the top controls which set of probabilities you're viewing:</p>
<p>&bull; <b>"Wildcards"</b> shows the default probabilities (the fallback when nothing special applies)<br>
&bull; Pick a <b>specific context</b> to see how probabilities differ in that situation<br>
&bull; <b>"All for state"</b> overlays every context for one circle at once<br>
&bull; <b>"Everything"</b> shows all arrows at once (can be busy!)</p>`
    },
    {
      title: 'Clicking around',
      body: `<p><b>Click a circle</b> to select it. The sidebar on the right will show all the arrows going out of and coming into that state.</p>
<p><b>Click an arrow</b> to select it. The sidebar will show the full set of probabilities for that context — every possible "next state" and its likelihood.</p>
<p><b>Drag a circle</b> to move it around the pitch. The layout is saved automatically so it'll be the same next time you open the editor.</p>
<p>Press <b>Escape</b> to deselect everything.</p>`
    },
    {
      title: 'Editing probabilities',
      body: `<p>When you click an arrow, the sidebar shows a list of number inputs — one per possible next state. These are the probabilities, and they need to add up to exactly 1.0 (meaning 100%).</p>
<p>The <b>colored bar</b> at the bottom shows the current sum. If it turns red, the numbers are out of balance. Click <b>"Normalize"</b> to automatically scale everything back to 1.0.</p>
<p>You can also type a new value, add new targets with the dropdown, or remove a target with the X button.</p>`
    },
    {
      title: 'Adding new stuff',
      body: `<p><b>Add State</b> — creates a new circle. Type a name (like "poss_wing_atk"), pick a category, then click on the pitch to place it.</p>
<p><b>Add Edge</b> — creates a new arrow. Click a source circle, then click a destination circle. This adds a new entry with probability 0 that you can then edit in the sidebar.</p>`
    },
    {
      title: 'Stat influences',
      body: `<p>Some transitions are affected by <b>player stats</b>. For example, a striker with high shooting is more likely to put a shot on target, while a keeper with high reflexes is more likely to make a save.</p>
<p>Check the <b>"Stat Influences"</b> box in the toolbar to see dashed white lines on the affected arrows. Click an arrow to see and edit which stats boost or resist that transition.</p>`
    },
    {
      title: 'Saving your work',
      body: `<p>The editor loads the current game data automatically when you open it — no setup needed.</p>
<p>When you've made changes, click <b>"Export"</b> to generate the JavaScript code. You can copy it to your clipboard and paste it into data.js to update the game.</p>
<p>Click <b>"Import"</b> if you want to load data from a different source.</p>
<p>Click <b>"Validate"</b> to check that all probabilities sum to 1.0 and all references are valid.</p>`
    },
    {
      title: 'Keyboard shortcuts',
      body: `<p>A few handy keys when you're not typing in an input field:</p>
<p>
<b>Escape</b> — deselect or cancel the current mode<br>
<b>Delete</b> — remove the selected circle or arrow<br>
<b>N</b> — normalize the selected probability distribution<br>
<b>?</b> — show this tutorial again
</p>
<p>That's everything — have fun exploring the match engine!</p>`
    },
  ];

  let tutorialStep = 0;

  function showTutorial() {
    tutorialStep = 0;
    renderTutorialStep();
  }

  function renderTutorialStep() {
    let overlay = document.getElementById('tutorial-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'tutorial-overlay';
      overlay.className = 'tutorial-overlay';
      document.body.appendChild(overlay);
    }
    overlay.classList.remove('hidden');

    const step = TUTORIAL_STEPS[tutorialStep];
    const isFirst = tutorialStep === 0;
    const isLast = tutorialStep === TUTORIAL_STEPS.length - 1;

    overlay.innerHTML = `
      <div class="tutorial-card">
        <div class="step-indicator">${tutorialStep + 1} / ${TUTORIAL_STEPS.length}</div>
        <h2>${step.title}</h2>
        ${step.body}
        <div class="tutorial-buttons">
          ${isFirst ? '' : '<button id="tut-prev">Back</button>'}
          <button id="tut-skip">Skip</button>
          <button id="tut-next" class="primary">${isLast ? 'Done' : 'Next'}</button>
        </div>
      </div>
    `;

    document.getElementById('tut-next').addEventListener('click', () => {
      if (isLast) { overlay.classList.add('hidden'); }
      else { tutorialStep++; renderTutorialStep(); }
    });
    document.getElementById('tut-skip').addEventListener('click', () => {
      overlay.classList.add('hidden');
      localStorage.setItem('markov-editor-tutorial-seen', '1');
    });
    const prevBtn = document.getElementById('tut-prev');
    if (prevBtn) prevBtn.addEventListener('click', () => { tutorialStep--; renderTutorialStep(); });

    if (isLast) localStorage.setItem('markov-editor-tutorial-seen', '1');
  }

  // Show tutorial on first visit
  if (!localStorage.getItem('markov-editor-tutorial-seen')) {
    setTimeout(showTutorial, 300);
  }

  // Help button + ? key
  document.getElementById('btn-help').addEventListener('click', showTutorial);

  // Boot
  init();
})();
