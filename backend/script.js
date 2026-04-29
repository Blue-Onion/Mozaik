async function hitEndpoint(i) {
  try {
    const res = await fetch("http://localhost:3000/health");
    const text = await res.text();

    console.log(`Request ${i}:`, res.status, text);
  } catch (err) {
    console.log(`Request ${i}: ERROR`, err.message);
  }
}

async function runTest() {
  const requests = 20;

  const promises = [];

  for (let i = 1; i <= requests; i++) {
    promises.push(hitEndpoint(i));
  }

  await Promise.all(promises);
}

runTest();
