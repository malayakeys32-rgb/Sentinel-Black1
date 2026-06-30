<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Sentinel-Black Tactical Ops</title>
  <link rel="stylesheet" href="styles.css" />
</head>

<body>
  <div class="sb-app">

    <!-- SIDEBAR -->
    <aside class="sb-sidebar">
      <div class="sb-logo">SB</div>
      <div class="sb-title">SENTINEL-BLACK</div>
      <div class="sb-subtitle">TACTICAL OPS DASHBOARD</div>

      <nav class="sb-nav">
        <button class="active">Dashboard</button>
        <button>Evidence Hub</button>
        <button>Ops Command</button>
        <button>System Health</button>
        <button>Settings</button>
      </nav>
    </aside>

    <!-- MAIN -->
    <main class="sb-main">

      <!-- TOP ROW -->
      <section class="sb-row">
        <div class="sb-card" id="system-status">
          <h2>System Status</h2>
          <ul>
            <li>Systems Online: <span id="systemsOnline">7</span></li>
            <li>Active Alerts: <span id="activeAlerts">2</span></li>
            <li>Operatives Deployed: <span id="operativesDeployed">5</span></li>
          </ul>
        </div>

        <div class="sb-card" id="mission-ops">
          <h2>Mission Operations</h2>
          <p>Current Op: <span id="currentOp">Night Watch</span></p>
          <p>Threat Level: <span id="threatLevel">HIGH</span></p>
          <div class="waveform"></div>
        </div>
      </section>

      <!-- BOTTOM ROW -->
      <section class="sb-row">
        <div class="sb-card" id="recent-activity">
          <h2>Recent Activity</h2>
          <ul id="activityList"></ul>
        </div>

        <div class="sb-card" id="intel-map">
          <h2>Intel Map</h2>
          <div class="map-placeholder"></div>
        </div>
      </section>

      <footer class="sb-footer">
        Sentinel-Black Tactical Ops System — v1.0 · Secure Link Established
      </footer>

    </main>
  </div>

  <script>
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => {
        document.getElementById('systemsOnline').textContent = data.systemsOnline;
        document.getElementById('activeAlerts').textContent = data.activeAlerts;
        document.getElementById('operativesDeployed').textContent = data.operativesDeployed;
        document.getElementById('currentOp').textContent = data.currentOp;
        document.getElementById('threatLevel').textContent = data.threatLevel;

        const list = document.getElementById('activityList');
        data.recentActivity.forEach(item => {
          const li = document.createElement('li');
          li.textContent = `${item.text} — ${item.time}`;
          list.appendChild(li);
        });
      });
  </script>

</body>
</html>
