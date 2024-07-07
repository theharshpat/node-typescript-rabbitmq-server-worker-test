import axios from 'axios';
import { TaskType, TaskPriority } from '@/shared';

const SERVER_URL = 'http://localhost:3000';

async function simulateRequests() {
  const tasks = [
    { type: TaskType.DATA_PROCESSING, priority: TaskPriority.LOW, data: 'Sample data 1' },
    { type: TaskType.IMAGE_RECOGNITION, priority: TaskPriority.MEDIUM, data: 'Sample image data' },
    { type: TaskType.TEXT_ANALYSIS, priority: TaskPriority.HIGH, data: 'Sample text for analysis' },
    { type: TaskType.DATA_PROCESSING, priority: TaskPriority.HIGH, data: 'Urgent data processing' },
    { type: TaskType.IMAGE_RECOGNITION, priority: TaskPriority.LOW, data: 'Low priority image' },
  ];

  for (const task of tasks) {
    try {
      const response = await axios.post(`${SERVER_URL}/task`, task, {
        params: { priority: task.priority }
      });
      console.log(`Task sent: ${JSON.stringify(task)}`);
      console.log(`Server response: ${JSON.stringify(response.data)}\n`);
    } catch (error) {
      console.error(`Error sending task: ${JSON.stringify(task)}`);
      console.error(error);
    }

    // Wait for 1 second before sending the next request
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

simulateRequests().catch(console.error);