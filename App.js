import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Button } from 'react-native';
import { Ionicons } from '@expo/vector-icons/'

const App = () => {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);
  const [objects, setObjects] = useState([]);
  const [missedFruitCount, setMissedFruitCount] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gamePaused, setGamePaused] = useState(false);

  const screenWidth = 300;
  const objectSpeed = 5;
  const objectSize = 60; // Tamanho dos emojis (largura e altura)
  const maxMissedFruits = 5; // Número máximo de frutas perdidas permitidas
  const fruits = ['🍉', '🍊', '🍏', '🍋', '🍇', '🍍', '🍓', '🍒']; // Lista de frutas disponíveis

  useEffect(() => {
    if (gameStarted && !gamePaused) {
      const intervalId = setInterval(() => {
        if (!gameOver && !victory) {
          const isBomb = Math.random() < 0.25; // 25% de chance de ser uma bomba
          const objectType = isBomb ? '💣' : fruits[Math.floor(Math.random() * fruits.length)];
          const newObject = {
            id: Date.now(),
            type: objectType,
            positionX: Math.random() * (screenWidth - objectSize),
            positionY: -objectSize, // Começa acima do topo da tela
            speed: objectSpeed,
          };
          setObjects((prevObjects) => [...prevObjects, newObject]);
        }
      }, 800); // Intervalo reduzido para aumentar a quantidade de objetos

      const moveObjectsInterval = setInterval(() => {
        if (!gameOver && !victory) {
          setObjects((prevObjects) =>
            prevObjects.map((object) => ({
              ...object,
              positionY: object.positionY + object.speed,
            }))
          );
        }
      }, 50);

      const checkCollisionInterval = setInterval(() => {
        if (!gameOver && !victory) {
          setObjects((prevObjects) => {
            const updatedObjects = prevObjects.filter((object) => {
              if (object.positionY >= 400) {
                if (object.type !== '💣') {
                  // Incrementa o contador de frutas perdidas
                  setMissedFruitCount((prevCount) => {
                    const newCount = prevCount + 1;
                    // Verifica se o número de frutas perdidas atingiu o limite
                    if (newCount >= maxMissedFruits) {
                      setGameOver(true); // Termina o jogo se atingir o limite de frutas perdidas
                    }
                    return newCount;
                  });
                }
                return false; // Remove o objeto da lista quando atingir o final da tela
              }
              return true;
            });
            return updatedObjects;
          });
        }
      }, 100);

      return () => {
        clearInterval(intervalId);
        clearInterval(moveObjectsInterval);
        clearInterval(checkCollisionInterval);
      };
    }
  }, [gameOver, victory, gameStarted, gamePaused]);

  const handleSlice = (objectId, objectType) => {
    if (!gameOver && !victory) {
      if (objectType === '💣') {
        setGameOver(true); // Fim de jogo se cortar uma bomba
      } else {
        setScore(score + 1); // Aumenta a pontuação se cortar uma fruta
        if (score + 1 >= 50) {
          setVictory(true); // Define vitória como verdadeira se a pontuação for igual ou superior a 50
        }
      }
      const updatedObjects = objects.filter((object) => object.id !== objectId);
      setObjects(updatedObjects);
    }
  };

  const handleRestart = () => {
    setScore(0);
    setGameOver(false);
    setVictory(false);
    setMissedFruitCount(0);
    setObjects([]);
  };

  const handlePause = () => {
    setGamePaused(true);
  };

  const handleResume = () => {
    setGamePaused(false);
  };

  return (
    <View style={styles.container}>
      {!gameStarted ? (
        <TouchableOpacity style={styles.startButton} onPress={() => setGameStarted(true)}>
          <Text style={styles.startButtonText}>
            <Ionicons size={40} color={"#fff"} name="play-circle-outline" />
          </Text>
        </TouchableOpacity>
      ) : (
        <>
          <Text style={styles.scoreText}>Pontuação: {score}</Text>
          <TouchableOpacity style={styles.pauseButton} onPress={handlePause}>
            <Text style={styles.pauseButtonText}>
              <Ionicons size={40} color={"#fff"} name="pause-circle-outline" />
            </Text>
          </TouchableOpacity>
          <View style={styles.gameArea}>
            {objects.map((object) => (
              <TouchableOpacity
                key={object.id}
                style={[styles.item, { left: object.positionX, top: object.positionY }]}
                onPress={() => handleSlice(object.id, object.type)}>
                <Text style={{ fontSize: 30 }}>{object.type}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.missedFruitsContainer}>
            <Text style={styles.missedFruitsTitle}>Frutas perdidas: {missedFruitCount}</Text>
          </View>
          <Modal
            visible={gamePaused}
            animationType="slide"
            transparent={true}
            onRequestClose={() => { }}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalText}>Jogo Pausado</Text>
                <Button title= {<Ionicons size={40} color={"#fff"} name="play-circle-outline" /> } onPress={handleResume} />
              </View>
            </View>
          </Modal>
          <Modal
            visible={victory}
            animationType="slide"
            transparent={true}
            onRequestClose={() => { }}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalText}>Você venceu!</Text>
                <Button title="Reiniciar Jogo" onPress={handleRestart} />
              </View>
            </View>
          </Modal>
          <Modal
            visible={gameOver}
            animationType="slide"
            transparent={true}
            onRequestClose={() => { }}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalText}>Você perdeu!</Text>
                <Button title="Reiniciar Jogo" onPress={handleRestart} />
              </View>
            </View>
          </Modal>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  startButton: {
    backgroundColor: 'blue',
    padding: 20,
    borderRadius: 10,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
  },
  pauseButton: {
    backgroundColor: 'orange',
    padding: 5,
    borderRadius: 10,
    marginTop: 10,
  },
  pauseButtonText: {
    color: 'white',
    fontSize: 18,
  },
  scoreText: {
    fontSize: 24,
    marginBottom: 10,
  },
  gameArea: {
    position: 'relative',
    width: 300,
    height: 400,
    borderWidth: 1,
    borderColor: 'black',
    overflow: 'hidden',
  },
  item: {
    position: 'absolute',
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missedFruitsContainer: {
    marginTop: 20,
    width: 200,
    height: 40,
    borderWidth: 1,
    borderColor: 'black',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  missedFruitsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default App;
