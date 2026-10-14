import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("MONGODB_URI must be set before seeding sample stories.");
}

const stories = [
  {
    sampleKey: "demo-student-01",
    authorName: "Demo Student 01",
    quote:
      "Fictional demo: A steady weekly plan helped me break a large syllabus into manageable steps and keep reviewing what I learned.",
    fullStory:
      "Fictional demo story. This example illustrates how a learner profile might be presented. It does not describe a real person, course experience, exam result, or selection.",
    achievement: "Sample study milestone — fictional",
    authorPhotoUrl: "/images/success-stories/demo-student-01.svg",
  },
  {
    sampleKey: "demo-student-02",
    authorName: "Demo Student 02",
    quote:
      "Fictional demo: Practicing with timed questions showed me where I needed more work and made it easier to plan focused revision.",
    fullStory:
      "Fictional demo story. This example illustrates how a learner profile might be presented. It does not describe a real person, course experience, exam result, or selection.",
    achievement: "Sample practice milestone — fictional",
    authorPhotoUrl: "/images/success-stories/demo-student-02.svg",
  },
  {
    sampleKey: "demo-student-03",
    authorName: "Demo Student 03",
    quote:
      "Fictional demo: Reviewing mistakes after each practice set helped me understand the topics more clearly and revise with purpose.",
    fullStory:
      "Fictional demo story. This example illustrates how a learner profile might be presented. It does not describe a real person, course experience, exam result, or selection.",
    achievement: "Sample revision milestone — fictional",
    authorPhotoUrl: "/images/success-stories/demo-student-03.svg",
  },
  {
    sampleKey: "demo-student-04",
    authorName: "Demo Student 04",
    quote:
      "Fictional demo: Short, consistent study sessions helped me build a routine around my other responsibilities.",
    fullStory:
      "Fictional demo story. This example illustrates how a learner profile might be presented. It does not describe a real person, course experience, exam result, or selection.",
    achievement: "Sample consistency milestone — fictional",
    authorPhotoUrl: "/images/success-stories/demo-student-04.svg",
  },
  {
    sampleKey: "demo-student-05",
    authorName: "Demo Student 05",
    quote:
      "Fictional demo: A clear topic checklist helped me see my progress and return to difficult areas instead of skipping them.",
    fullStory:
      "Fictional demo story. This example illustrates how a learner profile might be presented. It does not describe a real person, course experience, exam result, or selection.",
    achievement: "Sample planning milestone — fictional",
    authorPhotoUrl: "/images/success-stories/demo-student-05.svg",
  },
  {
    sampleKey: "demo-student-06",
    authorName: "Demo Student 06",
    quote:
      "Fictional demo: Revisiting notes and practicing recall helped me feel more organized as I worked through the syllabus.",
    fullStory:
      "Fictional demo story. This example illustrates how a learner profile might be presented. It does not describe a real person, course experience, exam result, or selection.",
    achievement: "Sample learning milestone — fictional",
    authorPhotoUrl: "/images/success-stories/demo-student-06.svg",
  },
];

const client = new MongoClient(uri, {
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
});

try {
  await client.connect();
  const collection = client.db("bjs-prep").collection("success_stories");
  const now = new Date();
  let inserted = 0;

  for (const story of stories) {
    const result = await collection.updateOne(
      { sampleKey: story.sampleKey },
      {
        $setOnInsert: {
          _id: new ObjectId(),
          authorEmail: `${story.sampleKey}@example.invalid`,
          authorUniversity: "Demo university",
          authorBatch: "Sample batch",
          ...story,
          isSample: true,
          status: "approved",
          isFeatured: false,
          order: 900 + inserted,
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

  console.log(
    `Seed complete: inserted ${inserted} fictional sample stories; existing samples were left unchanged.`
  );
} finally {
  await client.close();
}
