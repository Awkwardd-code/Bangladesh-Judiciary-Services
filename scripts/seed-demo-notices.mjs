import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("MONGODB_URI must be set before seeding demo notices.");
}

const notices = [
  {
    _id: new ObjectId("d00000000000000000000001"),
    title: "[DEMO NOTICE] Welcome to the student dashboard",
    excerpt:
      "Sample announcement for demonstrating where platform updates appear. This is fictional demo content.",
    body:
      "This is a fictional demo notice, added to demonstrate the announcement experience. It does not announce a real course, exam, deadline, or policy. Please disregard it when planning your studies.",
    audience: "all",
  },
  {
    _id: new ObjectId("d00000000000000000000002"),
    title: "[DEMO NOTICE] Study planner example",
    excerpt:
      "A sample study-planning reminder demonstrating a general student announcement.",
    body:
      "This is a fictional demo notice. Use your own study planner to set revision goals that suit your preparation. This example is not an official schedule or instruction from LegalPath Bangladesh.",
    audience: "students",
  },
  {
    _id: new ObjectId("d00000000000000000000003"),
    title: "[DEMO NOTICE] Practice dashboard example",
    excerpt:
      "A sample reminder showing how practice-related updates may be displayed.",
    body:
      "This is a fictional demo notice for preview purposes only. Students can use the practice dashboard to review available assessments and their submitted results. No new test or assessment is being announced here.",
    audience: "students",
  },
  {
    _id: new ObjectId("d00000000000000000000004"),
    title: "[DEMO NOTICE] Course materials example",
    excerpt:
      "A sample course-materials update used to demonstrate the notice layout.",
    body:
      "This is a fictional demo notice and does not confirm that any new material has been uploaded. Please check your enrolled course page for the actual materials available to you.",
    audience: "all",
  },
];

const client = new MongoClient(uri, {
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
});

try {
  await client.connect();
  const database = client.db("bjs-prep");
  const admin = await database
    .collection("users")
    .findOne({ isAdmin: 1 }, { projection: { _id: 1 } });

  if (!admin) {
    throw new Error("Cannot seed demo notices: no administrator account found.");
  }

  const collection = database.collection("notices");
  const now = new Date();
  let inserted = 0;

  for (const notice of notices) {
    const result = await collection.updateOne(
      { _id: notice._id },
      {
        $setOnInsert: {
          ...notice,
          status: "published",
          pinned: false,
          createdBy: new ObjectId(admin._id),
          publishedAt: now,
          createdAt: now,
          updatedAt: now,
        },
      },
      { upsert: true }
    );

    if (result.upsertedCount === 1) {
      inserted += 1;
    }
  }

  const verified = await collection
    .find({
      _id: { $in: notices.map(({ _id }) => _id) },
      status: "published",
      title: /^\[DEMO NOTICE\]/,
    })
    .toArray();

  if (verified.length !== notices.length) {
    throw new Error(
      `Demo notice verification failed: expected ${notices.length}, found ${verified.length}.`
    );
  }

  console.log(
    `Demo notice seed complete: inserted ${inserted}; verified ${verified.length} clearly labeled published notices. Existing notices were left unchanged.`
  );
} finally {
  await client.close();
}
