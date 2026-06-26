const assert = require("assert");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const request = async (baseUrl, path, options = {}) => {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const body = await response.json().catch(() => ({}));
  return { response, body };
};

const waitForMongo = () => {
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    mongoose.connection.once("open", resolve);
    mongoose.connection.once("error", reject);
  });
};

const run = async () => {
  const mongo = await MongoMemoryServer.create();

  process.env.PORT = "0";
  process.env.MONGO_URI = mongo.getUri();
  process.env.JWT_SECRET = "test-secret";

  const app = require("../server");
  const server = app.listen(0);
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  try {
    await waitForMongo();

    let result = await request(baseUrl, "/health");
    assert.strictEqual(result.response.status, 200);
    assert.strictEqual(result.body.success, true);

    result = await request(baseUrl, "/api/tasks");
    assert.strictEqual(result.response.status, 401);

    const testEmail = `test-${Date.now()}@example.com`;

    result = await request(baseUrl, "/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Test User",
        email: testEmail,
        password: "password123"
      })
    });
    assert.strictEqual(result.response.status, 201);
    assert.ok(result.body.token);

    result = await request(baseUrl, "/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: testEmail,
        password: "password123"
      })
    });
    assert.strictEqual(result.response.status, 200);
    assert.ok(result.body.token);

    const authHeaders = {
      Authorization: `Bearer ${result.body.token}`
    };

    result = await request(baseUrl, "/api/tasks", {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        title: "Finish API",
        description: "Verify task routes"
      })
    });
    assert.strictEqual(result.response.status, 201);
    assert.strictEqual(result.body.task.title, "Finish API");

    const taskId = result.body.task._id;

    result = await request(baseUrl, "/api/tasks", {
      headers: authHeaders
    });
    assert.strictEqual(result.response.status, 200);
    assert.strictEqual(result.body.tasks.length, 1);

    result = await request(baseUrl, `/api/tasks/${taskId}`, {
      headers: authHeaders
    });
    assert.strictEqual(result.response.status, 200);
    assert.strictEqual(result.body.task._id, taskId);

    result = await request(baseUrl, `/api/tasks/${taskId}`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({
        completed: true
      })
    });
    assert.strictEqual(result.response.status, 200);
    assert.strictEqual(result.body.task.completed, true);

    result = await request(baseUrl, `/api/tasks/${taskId}`, {
      method: "DELETE",
      headers: authHeaders
    });
    assert.strictEqual(result.response.status, 200);

    console.log("All route smoke tests passed.");
  } finally {
    await mongoose.disconnect();
    await mongo.stop();
    server.close();
  }
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
