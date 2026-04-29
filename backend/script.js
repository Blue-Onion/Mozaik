async function testRateLimit() {
  for (let i = 1; i <= 20; i++) {
    try {
      const res = await fetch("http://localhost:3000/health");
      const text = await res.text();

      console.log(`Request ${i}:`, res.status, text);
    } catch (err) {
      console.log(`Request ${i}: ERROR`, err.message);
    }

    // small delay so it's not *too* instant (optional tweak)
    await new Promise((r) => setTimeout(r, 200));
  }
}

testRateLimit();
