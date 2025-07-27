import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Voice from '@react-native-voice/voice';

interface SpeechToTextProps {
  onTranscript: (transcript: string) => void;
}

export function SpeechToText({ onTranscript }: SpeechToTextProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Voice.onSpeechStart = () => setIsListening(true);
    Voice.onSpeechEnd = () => setIsListening(false);
    Voice.onSpeechError = (e) => setError(e.error?.message || 'Speech recognition error');
    Voice.onSpeechResults = (e) => {
      if (e.value && e.value[0]) {
        setTranscript(e.value[0]);
      }
    };
    Voice.onSpeechPartialResults = (e) => {
      if (e.value && e.value[0]) {
        setTranscript(e.value[0]);
      }
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const startListening = async () => {
    try {
      setError(null);
      setTranscript('');
      await Voice.start('en-US');
    } catch (e) {
      setError('Failed to start speech recognition');
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
      if (transcript) {
        onTranscript(transcript);
      }
    } catch (e) {
      setError('Failed to stop speech recognition');
    }
  };

  const cancelListening = async () => {
    try {
      await Voice.cancel();
      setTranscript('');
    } catch (e) {
      setError('Failed to cancel speech recognition');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Speech to Text</Text>
      
      {transcript && (
        <View style={styles.transcriptContainer}>
          <Text style={styles.transcriptLabel}>Transcript:</Text>
          <Text style={styles.transcript}>{transcript}</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.controls}>
        <TouchableOpacity
          onPress={isListening ? stopListening : startListening}
          style={[styles.button, isListening ? styles.stopButton : styles.startButton]}
        >
          <Ionicons 
            name={isListening ? "stop" : "mic"} 
            size={24} 
            color="#fff" 
          />
          <Text style={styles.buttonText}>
            {isListening ? 'Stop' : 'Start'} Recording
          </Text>
        </TouchableOpacity>

        {isListening && (
          <TouchableOpacity onPress={cancelListening} style={styles.cancelButton}>
            <Ionicons name="close" size={20} color="#666" />
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>

      {isListening && (
        <View style={styles.listeningIndicator}>
          <View style={styles.pulse} />
          <Text style={styles.listeningText}>Listening...</Text>
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
    marginBottom: 16,
  },
  transcriptContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  transcriptLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6c757d',
    marginBottom: 4,
  },
  transcript: {
    fontSize: 16,
    color: '#212529',
    lineHeight: 24,
  },
  errorContainer: {
    backgroundColor: '#f8d7da',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#721c24',
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
  startButton: {
    backgroundColor: '#28a745',
  },
  stopButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#f8f9fa',
    gap: 4,
  },
  cancelText: {
    fontSize: 14,
    color: '#6c757d',
  },
  listeningIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  pulse: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#28a745',
    opacity: 0.6,
  },
  listeningText: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: '500',
  },
});