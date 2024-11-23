// "use client";

// import { useEffect, useRef, useState } from "react";
// import {
//   LiveConnectionState,
//   LiveTranscriptionEvent,
//   LiveTranscriptionEvents,
//   useDeepgram,
// } from "../context/DeepgramContextProvider";
// import {
//   MicrophoneEvents,
//   MicrophoneState,
//   useMicrophone,
// } from "../context/MicrophoneContextProvider";
// import Visualizer from "./Visualizer";

// const App: () => JSX.Element = () => {
//   const [caption, setCaption] = useState<string | undefined>(
//     "Powered by Deepgram"
//   );
//   const { connection, connectToDeepgram, connectionState } = useDeepgram();
//   const { setupMicrophone, microphone, startMicrophone, microphoneState } =
//     useMicrophone();
//   const captionTimeout = useRef<any>();
//   const keepAliveInterval = useRef<any>();

//   useEffect(() => {
//     setupMicrophone();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   useEffect(() => {
//     if (microphoneState === MicrophoneState.Ready) {
//       connectToDeepgram({
//         model: "nova-2",
//         interim_results: true,
//         smart_format: true,
//         filler_words: true,
//         utterance_end_ms: 3000,
//       });
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [microphoneState]);

//   useEffect(() => {
//     if (!microphone) return;
//     if (!connection) return;

//     const onData = (e: BlobEvent) => {
//       // iOS SAFARI FIX:
//       // Prevent packetZero from being sent. If sent at size 0, the connection will close. 
//       if (e.data.size > 0) {
//         connection?.send(e.data);
//       }
//     };

//     const onTranscript = (data: LiveTranscriptionEvent) => {
//       const { is_final: isFinal, speech_final: speechFinal } = data;
//       let thisCaption = data.channel.alternatives[0].transcript;

//       console.log("thisCaption", thisCaption);
//       if (thisCaption !== "") {
//         console.log('thisCaption !== ""', thisCaption);
//         setCaption(thisCaption);
//       }

//       if (isFinal && speechFinal) {
//         clearTimeout(captionTimeout.current);
//         captionTimeout.current = setTimeout(() => {
//           setCaption(undefined);
//           clearTimeout(captionTimeout.current);
//         }, 3000);
//       }
//     };

//     if (connectionState === LiveConnectionState.OPEN) {
//       connection.addListener(LiveTranscriptionEvents.Transcript, onTranscript);
//       microphone.addEventListener(MicrophoneEvents.DataAvailable, onData);

//       startMicrophone();
//     }

//     return () => {
//       // prettier-ignore
//       connection.removeListener(LiveTranscriptionEvents.Transcript, onTranscript);
//       microphone.removeEventListener(MicrophoneEvents.DataAvailable, onData);
//       clearTimeout(captionTimeout.current);
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [connectionState]);

//   useEffect(() => {
//     if (!connection) return;

//     if (
//       microphoneState !== MicrophoneState.Open &&
//       connectionState === LiveConnectionState.OPEN
//     ) {
//       connection.keepAlive();

//       keepAliveInterval.current = setInterval(() => {
//         connection.keepAlive();
//       }, 10000);
//     } else {
//       clearInterval(keepAliveInterval.current);
//     }

//     return () => {
//       clearInterval(keepAliveInterval.current);
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [microphoneState, connectionState]);

//   return (
//     <>
//       <div className="flex h-full antialiased">
//         <div className="flex flex-row h-full w-full overflow-x-hidden">
//           <div className="flex flex-col flex-auto h-full">
//             {/* height 100% minus 8rem */}
//             <div className="relative w-full h-full">
//               {microphone && <Visualizer microphone={microphone} />}
//               <div className="absolute bottom-[8rem]  inset-x-0 max-w-4xl mx-auto text-center">
//                 {caption && <span className="bg-black/70 p-8">{caption}</span>}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default App;

"use client";

import { useEffect, useRef, useState } from "react";
import {
  LiveConnectionState,
  LiveTranscriptionEvent,
  LiveTranscriptionEvents,
  useDeepgram,
} from "../context/DeepgramContextProvider";
import {
  MicrophoneEvents,
  MicrophoneState,
  useMicrophone,
} from "../context/MicrophoneContextProvider";
import Visualizer from "./Visualizer";

const App: () => JSX.Element = () => {
  const [caption, setCaption] = useState<string | undefined>(
    "Powered by Deepgram"
  );
  const [previousCaptions, setPreviousCaptions] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const { connection, connectToDeepgram, connectionState } = useDeepgram();
  const { setupMicrophone, microphone, startMicrophone, stopMicrophone, microphoneState } =
    useMicrophone();
  const captionTimeout = useRef<any>();
  const keepAliveInterval = useRef<any>();

  useEffect(() => {
    setupMicrophone();
  }, []);

  useEffect(() => {
    if (microphoneState === MicrophoneState.Ready) {
      connectToDeepgram({
        model: "nova-2",
        interim_results: true,
        smart_format: true,
        filler_words: true,
        utterance_end_ms: 3000,
      });
    }
  }, [microphoneState]);

  useEffect(() => {
    if (!microphone || !connection) return;

    const onData = (e: BlobEvent) => {
      if (e.data.size > 0) {
        connection?.send(e.data);
      }
    };

    const onTranscript = (data: LiveTranscriptionEvent) => {
      const { is_final: isFinal, speech_final: speechFinal } = data;
      let thisCaption = data.channel.alternatives[0].transcript;

      if (thisCaption !== "") {
        setCaption(thisCaption);
      }

      if (isFinal && speechFinal) {
        clearTimeout(captionTimeout.current);
        setPreviousCaptions((prev) => [...prev, thisCaption]); // Save previous caption
        captionTimeout.current = setTimeout(() => {
          setCaption(undefined);
          clearTimeout(captionTimeout.current);
        }, 3000);
      }
    };

    if (connectionState === LiveConnectionState.OPEN) {
      connection.addListener(LiveTranscriptionEvents.Transcript, onTranscript);
      microphone.addEventListener(MicrophoneEvents.DataAvailable, onData);

      if (isRecording) {
        startMicrophone();
      } else {
        stopMicrophone();
      }
    }

    return () => {
      connection.removeListener(LiveTranscriptionEvents.Transcript, onTranscript);
      microphone.removeEventListener(MicrophoneEvents.DataAvailable, onData);
      clearTimeout(captionTimeout.current);
    };
  }, [connectionState, isRecording]);

  useEffect(() => {
    if (!connection) return;

    if (
      microphoneState !== MicrophoneState.Open &&
      connectionState === LiveConnectionState.OPEN
    ) {
      connection.keepAlive();

      keepAliveInterval.current = setInterval(() => {
        connection.keepAlive();
      }, 10000);
    } else {
      clearInterval(keepAliveInterval.current);
    }

    return () => {
      clearInterval(keepAliveInterval.current);
    };
  }, [microphoneState, connectionState]);

  const handleMicToggle = () => {
    setIsRecording((prev) => !prev);
  };

  return (
    <div className="flex flex-col items-center h-screen text-white p-4">
      <h1 className="text-2xl font-bold mb-4">Live Transcription App</h1>
      <button
        onClick={handleMicToggle}
        className={`p-4 rounded-lg font-semibold ${
          isRecording ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
        }`}
      >
        {isRecording ? "Stop Recording 🔴" : "Start Recording 🎤"}
      </button>
      <div className="flex flex-row gap-4 mt-8 w-full max-w-4xl">
        {/* Live Captions Box */}
        <div className="flex-1 bg-gray-800 p-4 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold mb-2">Live Caption</h2>
          <div
            className={`h-32 flex items-center justify-center rounded-md p-4 ${
              caption ? "bg-green-600" : "bg-gray-700"
            }`}
          >
            {caption ? (
              <span className="text-lg">{caption}</span>
            ) : (
              <span className="text-gray-400">Waiting for transcription...</span>
            )}
          </div>
        </div>

        {/* Previous Captions Box */}
        <div className="flex-1 bg-gray-800 p-4 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold mb-2">Previous Captions</h2>
          <div className="h-32 overflow-y-auto bg-gray-700 rounded-md p-4">
            {previousCaptions.length > 0 ? (
              <ul className="space-y-2">
                {previousCaptions.map((prevCaption, index) => (
                  <li key={index} className="text-gray-300">
                    {prevCaption}
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-gray-400">No captions available.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
