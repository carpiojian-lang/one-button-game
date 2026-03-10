import React, { useState, useEffect, useRef } from "react";
import { View, Text, Pressable, StyleSheet, Animated } from "react-native";

export default function App() {
  const [gameState, setGameState] = useState("start");
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [round, setRound] = useState(0);
  const [balloonVisible, setBalloonVisible] = useState(false);

  const balloonAnim = useRef(new Animated.Value(0)).current;
  const balloonTargetXRef = useRef(0);
  const animationRef = useRef(null);
  const currentRoundRef = useRef(0);
  const gameStateRef = useRef(gameState);
  const scoreRef = useRef(score);

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

  const startRound = (roundNumber) => {
    if (animationRef.current) {
      animationRef.current.stop();
    }

    const duration = Math.max(700, 2200 - roundNumber * 150);

    const randomX = (Math.random() - 0.5) * 240;
    balloonTargetXRef.current = randomX;

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

  const handleBalloonTap = () => {
    if (gameStateRef.current !== "playing") return;
    if (!balloonVisible) return;

    setBalloonVisible(false);
    if (animationRef.current) {
      animationRef.current.stop();
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
  };

  const balloonTranslateY = balloonAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [140, -180],
  });

  const balloonTranslateX = balloonAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, balloonTargetXRef.current],
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
            <Pressable onPress={handleBalloonTap} hitSlop={20}>
              <View style={styles.balloonBody}>
                <View style={styles.balloonHighlight} />
              </View>
              <View style={styles.balloonString} />
            </Pressable>
          </Animated.View>
        )}
      </View>
      <Text style={styles.hint}>Tap directly on the balloon before it hits the spikes.</Text>
      <Text style={styles.life}>One life only. Miss it and it's over.</Text>
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
    justifyContent: "flex-end",
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
