import React, { useState, useEffect, useRef } from "react";
import { View, Text, Pressable, StyleSheet, Animated } from "react-native";
import { useAudioPlayer } from "expo-audio";

export default function App() {
  const [gameState, setGameState] = useState("start");
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [round, setRound] = useState(0);
  const [balloonVisible, setBalloonVisible] = useState(false);

  const balloonAnim = useRef(new Animated.Value(0)).current;
  const balloonProgressRef = useRef(0);
  const animationRef = useRef(null);
  const currentRoundRef = useRef(0);
  const gameStateRef = useRef(gameState);
  const scoreRef = useRef(score);

  const popPlayer = useAudioPlayer(require("./assets/Pop.mp3"));

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    const id = balloonAnim.addListener(({ value }) => {
      balloonProgressRef.current = value;
    });

    return () => {
      balloonAnim.removeListener(id);
    };
  }, [balloonAnim]);

  const startRound = (roundNumber) => {
    if (animationRef.current) {
      animationRef.current.stop();
    }

    const duration = Math.max(700, 2200 - roundNumber * 150);

    setBalloonVisible(true);
    balloonAnim.setValue(0);

    const anim = Animated.timing(balloonAnim, {
      toValue: 1,
      duration,
      useNativeDriver: true,
    });

    animationRef.current = anim;

    anim.start(({ finished }) => {
      if (
        finished &&
        gameStateRef.current === "playing" &&
        currentRoundRef.current === roundNumber
      ) {
        setBalloonVisible(false);
        setBestScore((prev) => Math.max(prev, scoreRef.current));
        setGameState("gameover");
      }
    });
  };

  const startGame = () => {
    setScore(0);
    setRound(1);
    currentRoundRef.current = 1;
    setGameState("playing");
    startRound(1);
  };

  const handleShoot = () => {
    if (gameStateRef.current !== "playing") return;
    if (!balloonVisible) return;

    const progress = balloonProgressRef.current;
    const hitMin = 0.45;
    const hitMax = 0.55;

    if (progress >= hitMin && progress <= hitMax) {
      setBalloonVisible(false);
      if (animationRef.current) {
        animationRef.current.stop();
      }

      if (popPlayer) {
        popPlayer.seekTo(0);
        popPlayer.play();
      }

      setScore((prev) => prev + 1);
      const nextRound = currentRoundRef.current + 1;
      currentRoundRef.current = nextRound;
      setRound(nextRound);

      setTimeout(() => {
        if (gameStateRef.current === "playing") {
          startRound(nextRound);
        }
      }, 400);
    } else {
      setBalloonVisible(false);
      if (animationRef.current) {
        animationRef.current.stop();
      }
      setBestScore((prev) => Math.max(prev, scoreRef.current));
      setGameState("gameover");
    }
  };

  const balloonTranslateY = balloonAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0],
  });

  const balloonTranslateX = balloonAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-140, 140],
  });

  if (gameState === "start") {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Pop the Balloon</Text>
        <Text style={styles.subtitle}>
          Tap directly on the balloon before it flies away.
          {"\n"}One life. One chance.
        </Text>
        <Pressable style={styles.button} onPress={startGame}>
          <Text style={styles.buttonText}>Start</Text>
        </Pressable>
      </View>
    );
  }

  if (gameState === "gameover") {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Game Over</Text>
        <Text style={styles.score}>Score: {score}</Text>
        <Text style={styles.bestScore}>Best: {bestScore}</Text>
        <Pressable style={styles.button} onPress={startGame}>
          <Text style={styles.buttonText}>Play Again</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.score}>Score: {score}</Text>
      <Text style={styles.round}>Round: {round}</Text>
      <View style={styles.gameArea}>
        <View style={styles.aimLine} />
        {balloonVisible && (
          <Animated.View
            style={[
              styles.balloon,
              {
                transform: [
                  { translateY: balloonTranslateY },
                  { translateX: balloonTranslateX },
                ],
              },
            ]}
          >
            <View style={styles.balloonBody}>
              <View style={styles.balloonHighlight} />
            </View>
            <View style={styles.balloonString} />
          </Animated.View>
        )}
      </View>
      <View style={styles.gunArea}>
        <View style={styles.gun}>
          <View style={styles.gunBarrel} />
        </View>
      </View>
      <Pressable style={styles.shootButton} onPress={handleShoot}>
        <Text style={styles.shootButtonText}>SHOOT</Text>
      </Pressable>
      <Text style={styles.hint}>Press SHOOT when the balloon crosses the line.</Text>
      <Text style={styles.life}>One life only. Miss and it's over.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#041322",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    color: "white",
    marginBottom: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#cfd8ff",
    textAlign: "center",
    marginBottom: 32,
  },
  score: {
    fontSize: 24,
    color: "white",
    marginBottom: 4,
  },
  round: {
    fontSize: 16,
    color: "#cfd8ff",
    marginBottom: 16,
  },
  bestScore: {
    fontSize: 18,
    color: "#cfd8ff",
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#ff6ea1",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 999,
    marginTop: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  gameArea: {
    width: "100%",
    maxWidth: 360,
    height: 340,
    borderRadius: 24,
    backgroundColor: "#0b2238",
    marginTop: 32,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  balloon: {
    alignItems: "center",
  },
  balloonBody: {
    width: 80,
    height: 100,
    borderRadius: 40,
    backgroundColor: "#ff6ea1",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  balloonHighlight: {
    width: 26,
    height: 40,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.45)",
    marginTop: 8,
    marginRight: 24,
    alignSelf: "flex-end",
  },
  balloonString: {
    width: 2,
    height: 60,
    backgroundColor: "#ffffff",
    marginTop: 4,
    alignSelf: "center",
  },
  aimLine: {
    position: "absolute",
    width: 4,
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  gunArea: {
    marginTop: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  gun: {
    width: 80,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#263238",
    alignItems: "center",
    justifyContent: "center",
  },
  gunBarrel: {
    width: 10,
    height: 26,
    borderRadius: 4,
    backgroundColor: "#b0bec5",
  },
  shootButton: {
    marginTop: 12,
    backgroundColor: "#ff5252",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 999,
  },
  shootButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 1,
  },
  hint: {
    marginTop: 24,
    color: "#cfd8ff",
    fontSize: 14,
    textAlign: "center",
  },
  life: {
    marginTop: 8,
    color: "#ffb74d",
    fontSize: 14,
    textAlign: "center",
  },
});
