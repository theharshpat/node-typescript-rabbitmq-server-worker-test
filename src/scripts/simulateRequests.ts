import axios from 'axios';
import { TaskType, TaskRequest } from '@/shared';

const SERVER_URL = 'http://localhost:3000';

async function simulateRequests() {
  const taskRequests: TaskRequest[] = [
    { type: TaskType.DATA_PROCESSING, data: 'Process customer data' },
    { type: TaskType.IMAGE_RECOGNITION, data: 'Analyze satellite imagery' },
    { type: TaskType.TEXT_ANALYSIS, data: 'Sentiment analysis on customer reviews' },
    { type: TaskType.DATA_PROCESSING, data: 'Generate monthly financial report' },
    { type: TaskType.IMAGE_RECOGNITION, data: 'Facial recognition for security system' },
  ];

  console.log("Starting to send task requests...");

  for (const request of taskRequests) {
    try {
      const response = await axios.post(`${SERVER_URL}/task`, request);
      console.log(`Task request sent: ${JSON.stringify(request)}`);
      console.log(`Server response: ${JSON.stringify(response.data)}\n`);
    } catch (error) {
      console.error(`Error sending task request: ${JSON.stringify(request)}`);
      console.error(error);
    }

    // Wait for 1 second before sending the next request
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log("All task requests sent. Worker should now process the generated tasks in order of priority.");
}

simulateRequests().catch(console.error);