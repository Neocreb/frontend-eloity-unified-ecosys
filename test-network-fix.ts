import { liveStreamService } from './src/services/liveStreamService';
import { callingService } from './src/services/callingService';

async function testNetworkFixes() {
  console.log('Testing network error handling fixes...');
  
  try {
    // Test live stream service getActiveBattles
    console.log('Testing liveStreamService.getActiveBattles()...');
    const battles = await liveStreamService.getActiveBattles();
    console.log('✅ getActiveBattles completed successfully (returned', battles.length, 'battles)');
    
    // Test calling service getCallHistory
    console.log('Testing callingService.getCallHistory()...');
    const callHistory = await callingService.getCallHistory('test-user-id');
    console.log('✅ getCallHistory completed successfully (returned', callHistory.length, 'calls)');
    
    console.log('All network error handling tests passed!');
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

testNetworkFixes();