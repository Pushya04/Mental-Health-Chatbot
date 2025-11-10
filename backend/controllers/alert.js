const tf=require('@tensorflow/tfjs-node')
const path = require('path');




async function loadModel() {
    const modelPath = path.join(__dirname, '../tfjs_model');
    console.log(modelPath)
    const model = await tf.loadLayersModel(`file://${modelPath}/model.json`);
    return model;
}

const loadedModel = loadModel();

// Use the loaded model to make predictions
async function makePrediction(sentence) {
  const normalizedSentence = normalized_sentence(sentence);
  const tokenizedSentence = tokenizer.texts_to_sequences([normalizedSentence]);
  const paddedSentence = pad_sequences(tokenizedSentence, maxlen=250, truncating='pre');
  const tensor = tf.tensor(paddedSentence);

  const prediction = loadedModel.predict(tensor);
  const predictionArray = prediction.arraySync();
  const resultIndex = predictionArray[0].indexOf(Math.max(...predictionArray[0]));
  const classNames = ['depression', 'non-suicide', 'suicide'];
  const resultClass = classNames[resultIndex];

  console.log(`Predicted class: ${resultClass}`);
}

// Call the function to make predictions
makePrediction("i want to kill myself");
    
    
    
    
    
    
