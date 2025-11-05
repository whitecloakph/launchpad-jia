export default function InterviewGuide() {
  const guide = [
    {
      title: "Find a quiet place.",
      description:
        "for the best experience, try to find a quiet place to speak.",
      image: "/assets/quiet.jpeg",
    },
    {
      title: "Speak Clearly.",
      description:
        "speak clearly and slowly, so I can understand you better. Make sure your microphone and speakers are working properly.",
      image: "/assets/speak.jpeg",
    },
    {
      title: "You can interrupt me anytime.",
      description: "when you need to, just interrupt me and I will pause.",
      image: "/assets/message.jpeg",
    },
  ];

  return (
    <div className="interview-guide">
      <h2 className="fade-in-bottom dl-2">Guides and Reminders</h2>
      <p className="fade-in-bottom">
        This is a guide for the interview. Follow these steps to get the best
        experience.
      </p>

      <div className="step-set">
        {guide.map((item, index) => (
          <div
            className="step-item fade-in-bottom"
            key={item.title}
            style={{ animationDelay: `${index * 0.5}s` }}
          >
            <div className="info-image">
              <img src={item.image} alt={item.title} />
            </div>
            <div className="info-text">
              <h3>{item.title}</h3>
              <p className="mt--2">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
