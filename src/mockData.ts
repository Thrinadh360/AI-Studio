// Pre-populated realistic mock database state that can be mutated in local memory for the preview environment.
import { User, Station, AttendanceLog, SyncFile, SystemLog, MaintenanceActivity, StationIssue } from './types';

// Mock Users: Fresh clean student registration list, zero preinstalled HOD/Admin accounts
export const initialUsers: User[] = [];

// Generate 50 Stations (CS-01 to CS-50) in factory locked state
export function generateStations(): Station[] {
  const stations: Station[] = [];
  const macAddresses = [
    '38:00:25:85:B7:D6', '3C:F8:62:D1:8A:2B', 'F4:F2:6D:E1:92:40', '70:85:C2:59:7A:B4',
    'A1:B2:C3:D4:E5:F6', '10:7B:44:A2:9C:15', '00:E0:4C:68:01:A2', 'E4:A4:71:08:92:2C',
    '08:00:27:7B:6A:11', '84:A6:C8:E0:21:4B', 'B8:27:EB:5C:3D:1E', '30:95:E3:69:8A:FF',
    'F8:FF:C2:A4:B3:0A', 'D4:3D:7E:59:E0:2B', '00:25:96:FF:A1:3F', '74:D4:35:E1:9F:8B',
    '9C:D2:1E:F0:8A:2C', 'A4:5E:60:FF:21:40', '00:15:5D:01:14:0A', '18:66:DA:5B:E0:6F',
  ];

  for (let i = 1; i <= 50; i++) {
    const stationId = `CS-${String(i).padStart(2, '0')}`;
    
    // Default locked state for pristine production ready setup
    stations.push({
      stationId,
      pcMacAddress: 'Pending First Run',
      status: 'LOCKED',
      activeUserId: null,
      activeUser: undefined,
      lastHeartbeat: new Date().toISOString()
    });
  }
  return stations;
}

// Default system logs representation
export const initialLogs: SystemLog[] = [
  { id: 'l1', timestamp: new Date().toLocaleTimeString(), level: 'info', message: 'C-SYNC microservice daemon booted successfully.', category: 'SYSTEM' },
  { id: 'l2', timestamp: new Date().toLocaleTimeString(), level: 'success', message: 'Pristine C-SYNC database state verified. Zero dummy records linked.', category: 'SYSTEM' },
];

// Initial empty file sync status for fresh deployment
export const initialFiles: SyncFile[] = [];

// Clean empty arrays for production simulation
export const initialAttendanceLogs: AttendanceLog[] = [];
export const initialIssues: StationIssue[] = [];
export const initialMaintenance: MaintenanceActivity[] = [];
