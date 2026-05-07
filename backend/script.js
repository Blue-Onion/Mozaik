// update_script.js

const userId = "a0686053-7d6e-4e03-93d9-3e36327a2bdf";
const API_BASE_URL = "http://localhost:3000/api";

async function getUserData(iteration) {
  try {
    const response = await fetch(`${API_BASE_URL}/get-user/${userId}`);

    let data;
    try {
      data = await response.json();
    } catch (err) {
      data = { message: "Response not JSON" };
    }

    if (!response.ok) {
      console.error(
        `\n[${iteration}] Failed (${response.status}):\n`,
        JSON.stringify(data, null, 2)
      );
      return;
    }

    console.log(
      `\n[${iteration}] Success (${response.status}):\n`,
      JSON.stringify(data, null, 2)
    );
  } catch (error) {
    console.error(`[${iteration}] Fetch Error:`, error.message);
  }
}

async function runLoadTest() {
  console.log(`Starting parallel load test (100 requests)...`);
  const startTime = Date.now();

  const requests = Array.from({ length: 100 }, (_, i) =>
    getUserData(i + 1)
  );

  await Promise.all(requests);

  const duration = (Date.now() - startTime) / 1000;
  console.log(`\nFinished 100 requests in ${duration} seconds.`);
}

runLoadTest();
