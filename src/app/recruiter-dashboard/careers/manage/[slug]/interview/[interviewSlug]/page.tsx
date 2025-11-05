"use client"
import axios from "axios";
import React, { useEffect, useState } from "react";
import moment from "moment";
import CardTypingLoader from "@/lib/components/AnalysisComponents/CardTypingLoader";
import HeaderBar from "@/lib/PageComponent/HeaderBar";
import { useParams } from "next/navigation";
import Swal from "sweetalert2";

export default function InterviewTranscript() {
    const { interviewSlug } = useParams();
    const [transcripts, setTranscripts] = useState<any[]>([]);
    const [interview, setInterview] = useState<any>(null);
    const [interviewRecording, setInterviewRecording] = useState<any>(null);
    const [loadingRecording, setLoadingRecording] = useState<boolean>(false);

    
    useEffect(() => {
        const fetchTranscripts = async () => {
            try {
              const response = await axios.post("/api/fetch-transcript", {
                id: interviewSlug,
              });
              setTranscripts(response.data);
            } catch (error) {
              console.log(error);
              Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Something went wrong!",
              });
            }
        }
          fetchTranscripts();
    }, [interviewSlug])

    async function finishUpload(interviewData: any) {
      setLoadingRecording(true);
      axios.post("/api/finish-upload", {
        uploadId: interviewData.interviewUpload.uploadId,
        parts: interviewData.interviewParts,
        fileName: interviewData.interviewUpload.key,
        filetype: interviewData.interviewUpload.filetype,
        uid: interviewData._id,
      }).then((res) => {
        // Update state
        setInterviewRecording({
          filename: interviewData.interviewUpload.key,
          filetype: interviewData.interviewUpload.filetype,
        });
      }).catch((err) => {
        console.log(err);
      }).finally(() => {
        setLoadingRecording(false);
      });
    }

    useEffect(() => {
        const fetchInterview = async () => {
            try {
              const response = await axios.post("/api/interview-details", {
                id: interviewSlug,
              });

              if (!response.data?.interviewRecording && response.data?.interviewUpload && response.data?.interviewParts?.length > 0) {
                finishUpload(response.data);
              }
              setInterview(response.data);
              if (response.data.interviewRecording) {
                setInterviewRecording(response.data.interviewRecording);
              }
            } catch (error) {
              console.log(error);
              Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Something went wrong!",
              });
            }
        }
        fetchInterview();
    }, [interviewSlug])
    
    return (
        <>
        <HeaderBar activeLink="Careers" currentPage={interview?.name} icon="la la-microphone" />
            <div className="container-fluid mt--7" style={{ paddingTop: "6rem" }}>
              <div className="row">
                <div className="col">
                  <div style={{ marginBottom: "35px"}}>
                    <h1 style={{ fontSize: "24px", fontWeight: 550, color: "#111827" }}>Interview Transcript</h1>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col">
                {loadingRecording ? (
                <div className="card" style={{ marginBottom: "16px" }}>
                  <div className="card-body">
                    <CardTypingLoader title="Loading Recording..." notesArray={["Loading Recording...", 400]} />
                  </div>
                </div>
                ) : interviewRecording?.filename ? (
                    <div className="card" style={{ marginBottom: "16px" }}>
                        <div className="card-header">
                        <h3 className="mb-0 mr-auto">
                            <i className="la la-microphone text-primary mr-2" />{" "}
                            {interview.interviewRecording.filetype.includes(
                            "audio"
                            )
                            ? "Audio Recording"
                            : "Video Recording"}
                        </h3>
                        </div>
                      <div className="card-body">
                      {interviewRecording.filetype.includes(
                          "audio"
                      ) ? (
                          <audio
                          style={{ width: "100%" }}
                          className="shadow-sm"
                          preload="auto"
                          controls
                          onError={(e) => {
                              console.error("Audio playback error:", e);
                          }}
                          >
                          <source
                              src={`https://cdn.hellojia.ai/${interviewRecording.filename}`}
                              type={interviewRecording.filetype}
                          />
                          </audio>
                      ) : (
                          <video
                          style={{ width: "70%", margin: "0 auto" }}
                          preload="metadata"
                          controls
                          src={`https://cdn.hellojia.ai/${interviewRecording.filename}`}
                          />
                      )}
                      </div>
                  </div>
                        ) : (
                            <div className="card" style={{ marginBottom: "16px" }}>
                              <div className="card-header">
                                <h3 className="mb-0 mr-auto">
                                    <i className="la la-microphone text-primary mr-2" />{" "}
                                    Interview Recording
                                </h3>
                              </div>
                                <div className="card-body">
                                    <span><i className="la la-microphone-slash" /> No Recording Available</span>
                                </div>
                            </div>
                        )}
                    </div>
                  </div>
                  <div className="row">
                    <div className="col">
                      <div className="card" style={{ marginBottom: "16px" }}>
                        <div className="card-header">
                          <h3 className="mb-0 mr-auto">
                          <i className="la la-file-text text-primary mr-2" />{" "}
                          Transcript
                          </h3>
                          {transcripts && transcripts.length > 0 && (
                            <span>
                                <i className="la la-clock text-primary" /> Interview
                                Duration:{" "}
                                <strong>
                                {(() => {
                                    const startTime = new Date(transcripts[0].time);
                                    const endTime = new Date(
                                    transcripts[transcripts.length - 1].time
                                    );
                                    const durationMs =
                                    endTime.getTime() - startTime.getTime();
                                    const minutes = Math.floor(durationMs / 60000);
                                    const seconds = Math.floor(
                                    (durationMs % 60000) / 1000
                                    );
                                    return `${minutes}m ${seconds}s`;
                                })()}
                                </strong>
                            </span>
                            )}
                        </div>
                        <div className="card-body">
                        <div className="live-transcript">
                            {!transcripts && (
                              <>
                                <CardTypingLoader
                                  title="Loading Transcript..."
                                  notesArray={[
                                    "Checking database for interview transcript...",
                                    400,
                                    "Please wait...",
                                    400,
                                  ]}
                                />
                              </>
                            )}

                            {transcripts && transcripts.length === 0 && (
                              <>
                                  <i className="la la-list text-muted" /> No
                                  Transcript Available.
                              </>
                            )}

                            <ul>
                              {transcripts &&
                                transcripts.length > 0 &&
                                transcripts.map((msg, idx) => {
                                  return (
                                    <React.Fragment key={idx}>
                                      <li
                                        key={idx}
                                        className={`fade-in-bottom ${
                                          msg.type === "user" ? "user" : "bot"
                                        }`}
                                      >
                                        <strong>
                                          {msg.type === "user"
                                            ? `${
                                                interview
                                                  ? interview.name
                                                  : "Applicant"
                                              }`
                                            : "Jia"}
                                          :
                                        </strong>{" "}
                                        {msg.content}
                                      </li>
                                      <div className="tr-time mt--2 mb-3 fade-in-bottom">
                                        <small>
                                          <i className="la la-square text-primary" />{" "}
                                          <i className="la la-clock" />{" "}
                                          {moment(msg.time).format("hh:mm A")}
                                        </small>

                                        <div className="line-div"></div>
                                        <small
                                          title={
                                            "Amout of time from the last message"
                                          }
                                        >
                                          <i className="la la-square text-primary" />{" "}
                                          <i className="la la-clock" />{" "}
                                          {idx > 0
                                            ? (() => {
                                                const duration = moment.duration(
                                                  moment(msg.time).diff(
                                                    moment(transcripts[idx - 1].time)
                                                  )
                                                );
                                                const seconds = duration.asSeconds();
                                                const minutes = Math.floor(
                                                  seconds / 60
                                                );
                                                return seconds >= 60
                                                  ? `${minutes}m ${(
                                                      seconds -
                                                      minutes * 60
                                                    ).toFixed(1)}s`
                                                  : `${seconds.toFixed(1)}s`;
                                              })()
                                            : "0.0s"}
                                        </small>
                                      </div>
                                    </React.Fragment>
                                  );
                                })}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
            </div>
        </>
    )
}
