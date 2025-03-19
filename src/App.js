import React, { useRef, useEffect, useState } from "react";
import {
  makeStyles,
  Button,
  Card,
  CardActions,
  CardContent,
  Typography,
  Grid,
  Grow,
} from "@material-ui/core";
import QrScanner from "qr-scanner";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100vw",
    height: "100vh",
    overflow: "auto",
  },
  video: {
    width: "100vw",
    height: "100vh",
    objectFit: "cover",
    zIndex: 0,
  },
  scannerTitle: {
    zIndex: 1000,
    color: "white",
    marginLeft: "15px",
    marginRight: "15px",
  },
  scannerTitleBackground: {
    position: "absolute",
    background: "black",
    opacity: 0.5,
    borderRadius: "20px",
    zIndex: 9,
    left: 0,
    top: 0,
    margin: theme.spacing(2),
  },
  card: {
    position: "absolute",
    zIndex: 9,
    left: 0,
    right: 0,
    top: 0,
    margin: theme.spacing(2),
  },
  fileInput: {
    display: "none",
  },
  qrPreview: {
    maxWidth: "100px",
    maxHeight: "100px",
    objectFit: "contain",
    borderRadius: "8px",
    marginTop: theme.spacing(1),
  },
}));

function App() {
  const videoRef = useRef(null);
  const classes = useStyles();
  const [result, setResult] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [scanning, setScanning] = useState(true); // New state to track scanning

  useEffect(() => {
    const qrScanner = new QrScanner(videoRef.current, (result) => {
      setResult(result);
      setScanning(false); // Stop scanning once a result is found
    });

    qrScanner.start().catch(console.error);
    return () => {
      qrScanner.destroy();
    };
  }, []);

  const handleOnScanAnother = () => {
    setResult(null);
    setImagePreview(null);
    setScanning(true); // Reset scanning state
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result); // Set the preview image
      };
      reader.readAsDataURL(file);

      QrScanner.scanImage(file)
        .then((result) => {
          setResult(result);
          setScanning(false); // Stop scanning when a result is found
        })
        .catch((error) => {
          console.error("Error scanning QR code from image:", error);
          setResult(null);
          setScanning(true); // Reset scanning on error
        });
    } else {
      console.error("Uploaded file is not a valid image");
    }
  };

  const handleCopyResult = () => {
    if (result) {
      navigator.clipboard.writeText(result).then(() => {
        alert("Result copied to clipboard!");
      }).catch((err) => {
        console.error("Failed to copy text: ", err);
      });
    }
  };

  const scanningView = (
    <div className={classes.scannerTitleBackground}>
      <Typography variant="body1" className={classes.scannerTitle}>
        {scanning ? "Scanning QR..." : "Scan Complete!"}
      </Typography>
      <label htmlFor="file-upload">
        <Button variant="contained" component="span" color="primary">
          Upload Image
        </Button>
      </label>
      <input
        id="file-upload"
        type="file"
        accept="image/*"
        className={classes.fileInput}
        onChange={handleFileChange}
      />
    </div>
  );

  const resultView = (
    <Grow in>
      <Card className={classes.card}>
        <CardContent>
          <Typography color="textPrimary">Result:</Typography>
          <Grid container>
            <Grid item>
              <Card variant="outlined">
                <CardContent style={{padding:"18px"}}>
                  <div>
                    {result}
                  </div>
                </CardContent>
              </Card>
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="QR Code Preview"
                  className={classes.qrPreview}
                />
              )}
            </Grid>
          </Grid>
        </CardContent>
        <CardActions>
          <Button onClick={handleOnScanAnother}>Scan another</Button>
          <Button onClick={handleCopyResult} color="primary">
            Copy Result
          </Button>
        </CardActions>
      </Card>
    </Grow>
  );

  return (
    <div className={classes.root}>
      <video className={classes.video} ref={videoRef} autoPlay muted />
      {result ? resultView : scanningView}
    </div>
  );
}

export default App;
