// Service Worker for handling background uploads
self.addEventListener('install', (event) => {
    self.skipWaiting();
  });
  
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});
  
self.addEventListener('message', async (event) => {
  if (event.data.type === 'UPLOAD_RECORDING') {
    const { recording, presignedUrl, interviewId } = event.data;
    const messagePort = event.ports[0];
    try {
      // Upload the recording
      const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        body: recording,
        headers: {
          'Content-Type': recording.type,
        }
      });

      if (uploadResponse.ok) {
        // Update interview status using fetch instead of axios
        const updateResponse = await fetch("/api/update-interview", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: {
              interviewRecording: {
                filename: recording.name,
                filetype: recording.type,
              },
            },
            uid: interviewId,
          })
        });

        if (!updateResponse.ok) {
          throw new Error('Failed to update interview status');
        }

        messagePort.postMessage({
          type: 'UPLOAD_COMPLETE',
          interviewId,
          success: true
        });
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      // Notify the client of failed upload
      messagePort.postMessage({
        type: 'UPLOAD_ERROR',
        interviewId,
        error: error.message
      });
    }
  }
});