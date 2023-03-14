import React, { useEffect, useState } from "react";
import Button from '@mui/material/Button';

import * as cocoSsd from "@tensorflow-models/coco-ssd";
import * as tf from "@tensorflow/tfjs";

import testImage from './images/2.jpg';

function App() {
  const imageRef = React.useRef(null);
  imageRef.crossOrigin = "anonymous";
  const [ model, setModel ] = useState();

  const [ imageLoaded, setImageLoaded ] = useState(false);
  const [ imageWidth, setImageWidth ] = useState(0);
  const [ imageHeight, setImageHeight ] = useState(0);

  useEffect(() => {
    !model && tf.ready().then(() => {
      console.log('START loadModel');
      loadModel();
    });
  // eslint-disable-next-line
  }, []);

  async function loadModel() {
    try {
      const model = await cocoSsd.load({base: 'mobilenet_v2'});
      setModel(model);
      console.log("set loaded model");
    } catch (err) {
      console.log(err);
      console.log("failed load model");
    }
  }

  useEffect(() => {
    console.log('initialize', window.innerWidth, window.innerHeight, imageRef.current.clientWidth, imageRef.current.clientHeight)
    setImageWidth(imageRef.current.clientWidth);
    setImageHeight(imageRef.current.clientHeight);
  }, [imageLoaded]);

  async function detectObjects() {
    const maxObjects = 20;
    const minConfidence = 0.50;
    const detectedObjects = await model.detect(document.getElementById("tfImage"), maxObjects, minConfidence);

    var cnvs = document.getElementById("tfCanvas");
    var ctx = cnvs.getContext("2d");
    ctx.clearRect(0, 0, imageWidth, imageHeight);

    if (detectedObjects.length > 0) {
      console.log('object list', detectedObjects);
      for (let n = 0; n < detectedObjects.length; n++) {
        if (detectedObjects[n].score > 0.1) {
          let bboxLeft = detectedObjects[n].bbox[0];
          let bboxTop = detectedObjects[n].bbox[1];
          let bboxWidth = detectedObjects[n].bbox[2];
          let bboxHeight = detectedObjects[n].bbox[3];

          ctx.beginPath();
          ctx.font = "12pt Arial";
          ctx.fillStyle = "#00ff00";

          ctx.fillText(
            detectedObjects[n].class + ": " + Math.round(parseFloat(detectedObjects[n].score) * 100) + "%",
            bboxLeft,
            bboxTop - 5
          );

          ctx.rect(bboxLeft, bboxTop, bboxWidth, bboxHeight);
          ctx.strokeStyle = "#00ff00";
          ctx.lineWidth = 4;
          ctx.stroke();

        }
      }
    }
  }

  return (
    <div className="App">
      <Button variant="contained" onClick={() => {detectObjects()}} sx={{margin: 1}} disabled={!model}>
        { model ? "DETECT" : "NOT READY" }
      </Button>

      <div style={{ position: "absolute", zIndex: 9999 }}>
        <canvas
          id="tfCanvas"
          width={imageWidth}
          height={imageHeight}
          style={{ backgroundColor: "transparent", border: '2px solid #00ff00' }}
        />
      </div>
      <div style={{ position: "absolute", zIndex: 1 }}>
        <img id="tfImage"
          src={testImage}
          alt="Test Detection"
          ref={imageRef}
          onLoad={() => setImageLoaded(true)}
        />
      </div>
    </div>
  );
}

export default App;
