import moment from "moment";

export function checkFile(file) {
  if (file.length > 1) {
    alert("Only one file is allowed.");
    return false;
  }

  if (file[0].size > 10 * 1024 * 1024) {
    alert("File size must be less than 10MB.");
    return false;
  }

  if (
    ![
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ].includes(file[0].type)
  ) {
    alert("Only PDF, DOC, DOCX, or TXT files are allowed.");
    return false;
  }

  return file[0];
}

export function formatFileSize(size) {
  return (size / 1024 / 1024).toFixed(2);
}

export function processDate(date) {
  const inputDate = moment(date).utcOffset(8).startOf("day");
  const now = moment().utcOffset(8).startOf("day");
  const diffDays = now.diff(inputDate, "days");

  if (diffDays < 1) {
    return "Today";
  }

  if (diffDays === 1) {
    return "Yesterday";
  }

  if (diffDays < 30) {
    return `${diffDays} days ago`;
  }

  const diffMonths = now.diff(inputDate, "months");

  if (diffMonths < 1) {
    return `${diffDays} days ago`;
  }

  return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
}

export function processDisplayDate(date) {
  return moment(date).format("MMM D, YYYY");
}
