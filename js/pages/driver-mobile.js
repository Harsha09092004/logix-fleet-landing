/**
 * Enterprise Driver Fleet Management
 * Manage driver assignments, certifications, truck allocations, and performance
 */

const DriverMobileApp = {
  render: () => {
    return `
      <div class="page-container">
        <div class="page-header">
          <h1>🚚 Enterprise Driver Fleet Management</h1>
          <p>Manage drivers, certifications, truck allocations, and performance metrics</p>
        </div>

        <!-- Driver KPIs -->
        <div style="display:grid; grid-template-columns: repeat(6, 1fr); gap:12px; margin-bottom:20px;">
          <div style="background:white; border-radius:8px; padding:12px; border:1px solid #ddd; text-align:center;">
            <div style="font-size:28px; font-weight:600; color:#4CAF50;">68</div>
            <div style="font-size:12px; color:#666; margin-top:4px;">Active Drivers</div>
          </div>
          <div style="background:white; border-radius:8px; padding:12px; border:1px solid #ddd; text-align:center;">
            <div style="font-size:28px; font-weight:600; color:#2196F3;">62</div>
            <div style="font-size:12px; color:#666; margin-top:4px;">Assigned</div>
          </div>
          <div style="background:white; border-radius:8px; padding:12px; border:1px solid #ddd; text-align:center;">
            <div style="font-size:28px; font-weight:600; color:#FF9800;">4,567 T</div>
            <div style="font-size:12px; color:#666; margin-top:4px;">Delivered (Month)</div>
          </div>
          <div style="background:white; border-radius:8px; padding:12px; border:1px solid #ddd; text-align:center;">
            <div style="font-size:28px; font-weight:600; color:#9C27B0;">96.8%</div>
            <div style="font-size:12px; color:#666; margin-top:4px;">On-Time Rate</div>
          </div>
          <div style="background:white; border-radius:8px; padding:12px; border:1px solid #ddd; text-align:center;">
            <div style="font-size:28px; font-weight:600; color:#E91E63;">99.2%</div>
            <div style="font-size:12px; color:#666; margin-top:4px;">Safety Score</div>
          </div>
          <div style="background:white; border-radius:8px; padding:12px; border:1px solid #ddd; text-align:center;">
            <div style="font-size:28px; font-weight:600; color:#00BCD4;">98%</div>
            <div style="font-size:12px; color:#666; margin-top:4px;">Compliance</div>
          </div>
        </div>

        <!-- Tab Navigation -->
        <div style="background:white; border-radius:8px; border:1px solid #ddd; overflow:hidden;">
          <div style="display:flex; border-bottom:1px solid #ddd;">
            <button class="tab-btn" id="driversTab" onclick="DriverMobileApp.switchTab('drivers')" style="flex:1; padding:12px; border:none; background:none; cursor:pointer; border-bottom:3px solid #2196F3; font-weight:600;">
              👥 Active Drivers
            </button>
            <button class="tab-btn" id="certificationsTab" onclick="DriverMobileApp.switchTab('certifications')" style="flex:1; padding:12px; border:none; background:none; cursor:pointer; border-bottom:3px solid transparent; color:#666; font-weight:600;">
              📜 Certifications
            </button>
            <button class="tab-btn" id="performanceTab" onclick="DriverMobileApp.switchTab('performance')" style="flex:1; padding:12px; border:none; background:none; cursor:pointer; border-bottom:3px solid transparent; color:#666; font-weight:600;">
              📊 Performance
            </button>
            <button class="tab-btn" id="assignmentsTab" onclick="DriverMobileApp.switchTab('assignments')" style="flex:1; padding:12px; border:none; background:none; cursor:pointer; border-bottom:3px solid transparent; color:#666; font-weight:600;">
              🚛 Assignments
            </button>
          </div>

          <!-- Drivers Tab Content -->
          <div id="driversContent" style="padding:16px;">
            <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap:12px;">
              <div style="background:#f9f9f9; border:1px solid #ddd; border-radius:8px; padding:12px;">
                <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:8px;">
                  <div>
                    <h4 style="margin:0; font-size:13px; font-weight:600;">Rajesh Kumar</h4>
                    <p style="margin:2px 0; font-size:11px; color:#666;">DRV-001 | 8 yrs experience</p>
                  </div>
                  <span style="background:#4CAF50; color:white; padding:2px 8px; border-radius:3px; font-size:10px;">🟢 Active</span>
                </div>
                <div style="background:white; padding:8px; border-radius:4px; margin-bottom:8px; font-size:11px; line-height:1.6;">
                  <div>🚚 <strong>Truck:</strong> TRK-MH-4521 (HMV - 25T)</div>
                  <div>📜 <strong>License:</strong> HMV | Valid: 2027</div>
                  <div>📋 <strong>Certs:</strong> FTL, LTL, HAZMAT</div>
                  <div>🎯 <strong>Current:</strong> 23.5T FTL</div>
                  <div>⏱️ <strong>On-Time:</strong> 97.5%</div>
                </div>
                <button class="btn btn-sm" style="width:100%; font-size:10px;">View Profile</button>
              </div>

              <div style="background:#f9f9f9; border:1px solid #ddd; border-radius:8px; padding:12px;">
                <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:8px;">
                  <div>
                    <h4 style="margin:0; font-size:13px; font-weight:600;">Priya Singh</h4>
                    <p style="margin:2px 0; font-size:11px; color:#666;">DRV-002 | 6 yrs experience</p>
                  </div>
                  <span style="background:#4CAF50; color:white; padding:2px 8px; border-radius:3px; font-size:10px;">🟢 Active</span>
                </div>
                <div style="background:white; padding:8px; border-radius:4px; margin-bottom:8px; font-size:11px; line-height:1.6;">
                  <div>🚚 <strong>Truck:</strong> TRK-MH-4015 (LTL - 12T)</div>
                  <div>📜 <strong>License:</strong> HMV | Valid: 2027</div>
                  <div>📋 <strong>Certs:</strong> FTL, LTL</div>
                  <div>🎯 <strong>Current:</strong> 9.2T LTL</div>
                  <div>⏱️ <strong>On-Time:</strong> 98.2%</div>
                </div>
                <button class="btn btn-sm" style="width:100%; font-size:10px;">View Profile</button>
              </div>

              <div style="background:#f9f9f9; border:1px solid #ddd; border-radius:8px; padding:12px;">
                <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:8px;">
                  <div>
                    <h4 style="margin:0; font-size:13px; font-weight:600;">Anil Verma</h4>
                    <p style="margin:2px 0; font-size:11px; color:#666;">DRV-003 | 4 yrs experience</p>
                  </div>
                  <span style="background:#FF9800; color:white; padding:2px 8px; border-radius:3px; font-size:10px;">🟡 Idle</span>
                </div>
                <div style="background:white; padding:8px; border-radius:4px; margin-bottom:8px; font-size:11px; line-height:1.6;">
                  <div>🚚 <strong>Truck:</strong> TRK-MH-3892 (LTL - 8T)</div>
                  <div>📜 <strong>License:</strong> HMV | Valid: 2026</div>
                  <div>📋 <strong>Certs:</strong> LTL</div>
                  <div>🎯 <strong>Current:</strong> Unassigned</div>
                  <div>⏱️ <strong>On-Time:</strong> 94.1%</div>
                </div>
                <button class="btn btn-sm" style="width:100%; font-size:10px;">View Profile</button>
              </div>
            </div>
          </div>

          <!-- Certifications Tab Content -->
          <div id="certificationsContent" style="padding:16px; display:none;">
            <h4 style="margin:0 0 12px 0; font-size:13px;">📜 Driver Certifications & Compliance Status</h4>
            <table style="width:100%; font-size:11px; border-collapse:collapse;">
              <thead style="background:#f5f5f5;">
                <tr style="border-bottom:1px solid #ddd;">
                  <th style="padding:8px; text-align:left;">Driver</th>
                  <th style="padding:8px; text-align:center;">License</th>
                  <th style="padding:8px; text-align:center;">FTL</th>
                  <th style="padding:8px; text-align:center;">LTL</th>
                  <th style="padding:8px; text-align:center;">HAZMAT</th>
                  <th style="padding:8px; text-align:center;">Medical</th>
                  <th style="padding:8px; text-align:center;">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom:1px solid #eee;">
                  <td style="padding:8px;">Rajesh Kumar (DRV-001)</td>
                  <td style="padding:8px; text-align:center;"><span style="background:#c8e6c9; padding:2px 6px; border-radius:2px;">HMV ✓</span></td>
                  <td style="padding:8px; text-align:center;"><span style="background:#c8e6c9; padding:2px 6px; border-radius:2px;">Valid</span></td>
                  <td style="padding:8px; text-align:center;"><span style="background:#c8e6c9; padding:2px 6px; border-radius:2px;">Valid</span></td>
                  <td style="padding:8px; text-align:center;"><span style="background:#c8e6c9; padding:2px 6px; border-radius:2px;">Valid</span></td>
                  <td style="padding:8px; text-align:center;"><span style="background:#c8e6c9; padding:2px 6px; border-radius:2px;">Jun'26</span></td>
                  <td style="padding:8px; text-align:center;"><span style="background:#c8e6c9; padding:2px 4px; border-radius:2px; font-weight:600; color:#2e7d32;">✓ OK</span></td>
                </tr>
                <tr style="border-bottom:1px solid #eee;">
                  <td style="padding:8px;">Priya Singh (DRV-002)</td>
                  <td style="padding:8px; text-align:center;"><span style="background:#c8e6c9; padding:2px 6px; border-radius:2px;">HMV ✓</span></td>
                  <td style="padding:8px; text-align:center;"><span style="background:#c8e6c9; padding:2px 6px; border-radius:2px;">Valid</span></td>
                  <td style="padding:8px; text-align:center;"><span style="background:#c8e6c9; padding:2px 6px; border-radius:2px;">Valid</span></td>
                  <td style="padding:8px; text-align:center;"><span style="background:#ffccbc; padding:2px 6px; border-radius:2px;">Expired</span></td>
                  <td style="padding:8px; text-align:center;"><span style="background:#c8e6c9; padding:2px 6px; border-radius:2px;">Aug'26</span></td>
                  <td style="padding:8px; text-align:center;"><span style="background:#fff9c4; padding:2px 4px; border-radius:2px; font-weight:600; color:#e65100;">⚠ Pending</span></td>
                </tr>
                <tr>
                  <td style="padding:8px;">Anil Verma (DRV-003)</td>
                  <td style="padding:8px; text-align:center;"><span style="background:#c8e6c9; padding:2px 6px; border-radius:2px;">HMV ✓</span></td>
                  <td style="padding:8px; text-align:center;"><span style="background:#ffccbc; padding:2px 6px; border-radius:2px;">Expired</span></td>
                  <td style="padding:8px; text-align:center;"><span style="background:#c8e6c9; padding:2px 6px; border-radius:2px;">Valid</span></td>
                  <td style="padding:8px; text-align:center;"><span style="background:#ffccbc; padding:2px 6px; border-radius:2px;">N/A</span></td>
                  <td style="padding:8px; text-align:center;"><span style="background:#c8e6c9; padding:2px 6px; border-radius:2px;">May'26</span></td>
                  <td style="padding:8px; text-align:center;"><span style="background:#ffccbc; padding:2px 4px; border-radius:2px; font-weight:600; color:#c62828;">✗ Failed</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Performance Tab Content -->
          <div id="performanceContent" style="padding:16px; display:none;">
            <table style="width:100%; font-size:11px; border-collapse:collapse;">
              <thead style="background:#f5f5f5;">
                <tr style="border-bottom:1px solid #ddd;">
                  <th style="padding:8px; text-align:left;">Driver</th>
                  <th style="padding:8px; text-align:center;">Shipments</th>
                  <th style="padding:8px; text-align:center;">Weight (T)</th>
                  <th style="padding:8px; text-align:center;">On-Time %</th>
                  <th style="padding:8px; text-align:center;">Damage %</th>
                  <th style="padding:8px; text-align:center;">Rating</th>
                  <th style="padding:8px; text-align:center;">Incentive</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom:1px solid #eee;">
                  <td style="padding:8px;">Rajesh Kumar (DRV-001)</td>
                  <td style="padding:8px; text-align:center;">145</td>
                  <td style="padding:8px; text-align:center;">2,150</td>
                  <td style="padding:8px; text-align:center; color:#4CAF50; font-weight:600;">97.5%</td>
                  <td style="padding:8px; text-align:center; color:#4CAF50;">0.1%</td>
                  <td style="padding:8px; text-align:center;">⭐4.9</td>
                  <td style="padding:8px; text-align:center; color:#2196F3; font-weight:600;">₹18,500</td>
                </tr>
                <tr style="border-bottom:1px solid #eee;">
                  <td style="padding:8px;">Priya Singh (DRV-002)</td>
                  <td style="padding:8px; text-align:center;">128</td>
                  <td style="padding:8px; text-align:center;">890</td>
                  <td style="padding:8px; text-align:center; color:#4CAF50; font-weight:600;">98.2%</td>
                  <td style="padding:8px; text-align:center; color:#4CAF50;">0.0%</td>
                  <td style="padding:8px; text-align:center;">⭐4.8</td>
                  <td style="padding:8px; text-align:center; color:#2196F3; font-weight:600;">₹16,200</td>
                </tr>
                <tr>
                  <td style="padding:8px;">Anil Verma (DRV-003)</td>
                  <td style="padding:8px; text-align:center;">98</td>
                  <td style="padding:8px; text-align:center;">720</td>
                  <td style="padding:8px; text-align:center; color:#FF9800; font-weight:600;">94.1%</td>
                  <td style="padding:8px; text-align:center; color:#FF9800;">0.3%</td>
                  <td style="padding:8px; text-align:center;">⭐4.5</td>
                  <td style="padding:8px; text-align:center; color:#2196F3; font-weight:600;">₹12,800</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Assignments Tab Content -->
          <div id="assignmentsContent" style="padding:16px; display:none;">
            <h4 style="margin:0 0 12px 0; font-size:13px;">🚛 Current Shipment Assignments</h4>
            <table style="width:100%; font-size:11px; border-collapse:collapse;">
              <thead style="background:#f5f5f5;">
                <tr style="border-bottom:1px solid #ddd;">
                  <th style="padding:8px; text-align:left;">Driver</th>
                  <th style="padding:8px; text-align:center;">Type</th>
                  <th style="padding:8px; text-align:center;">Client</th>
                  <th style="padding:8px; text-align:center;">Weight</th>
                  <th style="padding:8px; text-align:center;">Route</th>
                  <th style="padding:8px; text-align:center;">ETA</th>
                  <th style="padding:8px; text-align:center;">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom:1px solid #eee;">
                  <td style="padding:8px;">Rajesh Kumar</td>
                  <td style="padding:8px; text-align:center;"><span style="background:#e3f2fd; padding:2px 6px; border-radius:2px; font-size:9px;">FTL</span></td>
                  <td style="padding:8px; text-align:center;">TCS Supply</td>
                  <td style="padding:8px; text-align:center; font-weight:600;">23.5 T</td>
                  <td style="padding:8px; text-align:center; font-size:9px;">MUM ➜ DEL</td>
                  <td style="padding:8px; text-align:center;">08:30</td>
                  <td style="padding:8px; text-align:center;"><span style="background:#c8e6c9; padding:2px 6px; border-radius:2px; font-size:9px;">In Transit</span></td>
                </tr>
                <tr style="border-bottom:1px solid #eee;">
                  <td style="padding:8px;">Priya Singh</td>
                  <td style="padding:8px; text-align:center;"><span style="background:#fff0f5; padding:2px 6px; border-radius:2px; font-size:9px;">LTL</span></td>
                  <td style="padding:8px; text-align:center;">Amazon Logistics</td>
                  <td style="padding:8px; text-align:center; font-weight:600;">9.2 T</td>
                  <td style="padding:8px; text-align:center; font-size:9px;">BLR ➜ CHN</td>
                  <td style="padding:8px; text-align:center;">15:45</td>
                  <td style="padding:8px; text-align:center;"><span style="background:#c8e6c9; padding:2px 6px; border-radius:2px; font-size:9px;">In Transit</span></td>
                </tr>
                <tr>
                  <td style="padding:8px;">Anil Verma</td>
                  <td style="padding:8px; text-align:center;">—</td>
                  <td style="padding:8px; text-align:center;">—</td>
                  <td style="padding:8px; text-align:center;">—</td>
                  <td style="padding:8px; text-align:center;">—</td>
                  <td style="padding:8px; text-align:center;">—</td>
                  <td style="padding:8px; text-align:center;"><span style="background:#fff9c4; padding:2px 6px; border-radius:2px; font-size:9px;">Awaiting</span></td>
                </tr>
              </tbody>
            </table>
            <div style="margin-top:12px;">
              <button class="btn btn-primary" onclick="DriverMobileApp.assignShipment()">📦 Assign New Shipment</button>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div style="margin-top:20px; display:grid; grid-template-columns: repeat(4, 1fr); gap:12px;">
          <button class="btn btn-primary btn-sm" onclick="DriverMobileApp.hireNewDriver()">➕ Hire Driver</button>
          <button class="btn btn-outline btn-sm" onclick="DriverMobileApp.renewCertification()">🔄 Renew Certs</button>
          <button class="btn btn-outline btn-sm" onclick="DriverMobileApp.generatePerformanceReport()">📊 Report</button>
          <button class="btn btn-outline btn-sm" onclick="DriverMobileApp.configureSettings()">⚙️ Settings</button>
        </div>
      </div>
    `;
  },

  init: () => {
    console.log('🚚 Enterprise Driver Fleet Management Initialized');
  },

  switchTab: (tab) => {
    const tabs = ['drivers', 'certifications', 'performance', 'assignments'];
    tabs.forEach(t => {
      const content = document.getElementById(t + 'Content');
      const tabBtn = document.getElementById(t + 'Tab');
      if (t === tab) {
        if (content) content.style.display = 'block';
        if (tabBtn) {
          tabBtn.style.borderBottomColor = '#2196F3';
          tabBtn.style.color = '#000';
        }
      } else {
        if (content) content.style.display = 'none';
        if (tabBtn) {
          tabBtn.style.borderBottomColor = 'transparent';
          tabBtn.style.color = '#666';
        }
      }
    });
  },

  viewDriverDetail: (id) => alert('Driver ' + id + ' details - Coming soon'),
  viewCertifications: (id) => alert('Certifications for ' + id + ' - Coming soon'),
  assignShipment: () => alert('Assign shipment - Coming soon'),
  hireNewDriver: () => alert('Hire new driver - Coming soon'),
  renewCertification: () => alert('Renew certification - Coming soon'),
  generatePerformanceReport: () => alert('Generate performance report - Coming soon'),
  configureSettings: () => alert('Configure settings - Coming soon')
};
