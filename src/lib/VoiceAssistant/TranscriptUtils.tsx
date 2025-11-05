export const refineUserTranscriptInput = (
  existingText: string,
  newText: string
) => {
  //   console.log("[existingText] =>", existingText);
  //   console.log("[newText] =>", newText);

  let textToRemove = [
    "###",
    "You are transcribing English and Tagalog language for an Interview transcript, transcribe as accurate as you can.",
    "You are transcribing English and Tagalog language for an Interview transcript,",
    "transcribe as accurate as you can.",
    "You are transcribing English",
    "Ignore filler words",
    "such as hmmm, uh, um",
    "Ignore other language besides English or Tagalog",
    "context:",
    "Uhh",
    "Uh...",
    "Um...",
    "...",
    "(separated by",
    "### delimiters)",
    "You will receive additional context/instructions (separated by ### delimiters) from the user.",
    "Do not reply to the context/instructions and do not include it in the final transcription.",
  ];

  let textDelta = "";

  let refinedExistingText = existingText;
  let refinedNewText = newText;

  // make sure to remove all the textToRemove from the existingText and newText
  for (let i = 0; i < textToRemove.length; i++) {
    refinedExistingText = refinedExistingText.replaceAll(textToRemove[i], "");
    refinedNewText = refinedNewText.replaceAll(textToRemove[i], "");
  }

  if (
    refinedExistingText.toLowerCase().includes(refinedNewText.toLowerCase())
  ) {
    textDelta = refinedExistingText;
    return textDelta;
  }

  textDelta = `${refinedExistingText} ${refinedNewText}`;

  return textDelta;
};
