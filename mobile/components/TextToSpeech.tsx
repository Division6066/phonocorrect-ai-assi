import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';

interface TextToSpeechProps {
  text: string;
}

export function TextToSpeech({ text }: TextToSpeechProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const speak = async () => {
    try {
      setIsSpeaking(true);
      setIsPaused(false);
      
      await Speech.speak(text, {
        onStart: () => setIsSpeaking(true),
        onDone: () => {
          setIsSpeaking(false);
          setIsPaused(false);
        },
        onStopped: () => {
          setIsSpeaking(false);
          setIsPaused(false);
        },
        onError: () => {
          setIsSpeaking(false);
          setIsPaused(false);
        },
      });
    } catch (error) {
      setIsSpeaking(false);
      setIsPaused(false);
    }
  };

  const pause = () => {
    Speech.pause();
    setIsPaused(true);
  };

  const resume = () => {
    Speech.resume();
    setIsPaused(false);
  };

  const stop = () => {
    Speech.stop();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Text-to-Speech</Text>
      <Text style={styles.description}>
        Listen to your text being read aloud
      </Text>

      <View style={styles.controls}>
        <TouchableOpacity
          onPress={isSpeaking ? stop : speak}
          style={[styles.button, isSpeaking ? styles.stopButton : styles.playButton]}
        >
          <Ionicons 
            name={isSpeaking ? "stop" : "play"} 
            size={20} 
            color="#fff" 
          />
          <Text style={styles.buttonText}>
            {isSpeaking ? 'Stop' : 'Read Aloud'}
          </Text>
        </TouchableOpacity>

        {isSpeaking && (
          <TouchableOpacity
            onPress={isPaused ? resume : pause}
            style={styles.pauseButton}
          >
            <Ionicons 
              name={isPaused ? "play" : "pause"} 
              size={16} 
              color="#666" 
            />
            <Text style={styles.pauseText}>
              {isPaused ? 'Resume' : 'Pause'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {isSpeaking && (
        <View style={styles.statusIndicator}>
          <View style={[styles.indicator, !isPaused && styles.indicatorActive]} />
          <Text style={styles.statusText}>
            {isPaused ? 'Paused' : 'Speaking...'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 16,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
    gap: 8,
  },
  playButton: {
    backgroundColor: '#007AFF',
  },
  stopButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  pauseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#f8f9fa',
    gap: 4,
  },
  pauseText: {
    fontSize: 14,
    color: '#6c757d',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#dc3545',
  },
  indicatorActive: {
    backgroundColor: '#007AFF',
  },
  statusText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
});