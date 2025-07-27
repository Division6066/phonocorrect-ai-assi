import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePhonoEngine } from '@phonocorrect-ai/common';
import { SuggestionCard } from './components/SuggestionCard';
import { SpeechToText } from './components/SpeechToText';
import { TextToSpeech } from './components/TextToSpeech';

const EXAMPLE_TEXT = "I recieve your fone call about the seperate meetng. Would of been nice to no earlier. Definately going thru the new fisiscs problems.";

export default function App() {
  const [text, setText] = useState('');
  const [showSpeechToText, setShowSpeechToText] = useState(false);
  
  const {
    suggestions,
    isAnalyzing,
    recordFeedback,
    applySuggestion,
    getConfidenceColor,
    getConfidenceLabel,
  } = usePhonoEngine(text);

  const handleAcceptSuggestion = (suggestion: any) => {
    const newText = applySuggestion(suggestion, text);
    setText(newText);
    recordFeedback(suggestion.pattern, true);
  };

  const handleRejectSuggestion = (suggestion: any) => {
    recordFeedback(suggestion.pattern, false);
  };

  const loadExample = () => {
    setText(EXAMPLE_TEXT);
  };

  const clearText = () => {
    setText('');
  };

  const handleTranscript = (transcript: string) => {
    setText(transcript);
    setShowSpeechToText(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="brain" size={32} color="#007AFF" />
          <Text style={styles.title}>PhonoCorrect AI</Text>
        </View>
        <Text style={styles.subtitle}>
          Phonetic spelling assistant for confident writing
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Writing Area */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Writing Area</Text>
            <View style={styles.headerButtons}>
              <TouchableOpacity onPress={loadExample} style={styles.iconButton}>
                <Ionicons name="document-text" size={20} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity onPress={clearText} style={styles.iconButton}>
                <Ionicons name="refresh" size={20} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setShowSpeechToText(!showSpeechToText)} 
                style={[styles.iconButton, showSpeechToText && styles.activeButton]}
              >
                <Ionicons name="mic" size={20} color={showSpeechToText ? "#007AFF" : "#666"} />
              </TouchableOpacity>
            </View>
          </View>
          
          <TextInput
            style={styles.textInput}
            value={text}
            onChangeText={setText}
            placeholder="Start typing your message here. Try words like 'fone', 'seperate', or 'recieve' to see phonetic corrections..."
            multiline
            textAlignVertical="top"
          />
          
          <View style={styles.textStats}>
            <Text style={styles.statText}>
              {text.trim().split(/\s+/).filter(word => word.length > 0).length} words
            </Text>
            {suggestions.length > 0 && (
              <Text style={styles.suggestionCount}>
                {suggestions.length} suggestion{suggestions.length === 1 ? '' : 's'}
              </Text>
            )}
            {isAnalyzing && (
              <Text style={styles.analyzing}>Analyzing...</Text>
            )}
          </View>
        </View>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Phonetic Suggestions</Text>
            {suggestions.map((suggestion, index) => (
              <SuggestionCard
                key={`${suggestion.startIndex}-${suggestion.original}-${index}`}
                suggestion={suggestion}
                onAccept={() => handleAcceptSuggestion(suggestion)}
                onReject={() => handleRejectSuggestion(suggestion)}
                getConfidenceColor={getConfidenceColor}
                getConfidenceLabel={getConfidenceLabel}
              />
            ))}
          </View>
        )}

        {/* Text-to-Speech */}
        {text.trim() && <TextToSpeech text={text} />}

        {/* Speech-to-Text */}
        {showSpeechToText && (
          <SpeechToText onTranscript={handleTranscript} />
        )}

        {/* Help */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>How It Works</Text>
          <View style={styles.helpItem}>
            <Text style={styles.helpTitle}>1. Type Naturally</Text>
            <Text style={styles.helpText}>
              Write how words sound to you. Don't worry about perfect spelling.
            </Text>
          </View>
          <View style={styles.helpItem}>
            <Text style={styles.helpTitle}>2. Get Smart Suggestions</Text>
            <Text style={styles.helpText}>
              Our AI recognizes phonetic patterns and suggests corrections.
            </Text>
          </View>
          <View style={styles.helpItem}>
            <Text style={styles.helpTitle}>3. Learn Together</Text>
            <Text style={styles.helpText}>
              Accept or reject suggestions to teach the system your preferences.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 12,
    color: '#212529',
  },
  subtitle: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  card: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  activeButton: {
    backgroundColor: '#e3f2fd',
  },
  textInput: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    lineHeight: 24,
    color: '#212529',
  },
  textStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  statText: {
    fontSize: 14,
    color: '#6c757d',
  },
  suggestionCount: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  analyzing: {
    fontSize: 14,
    color: '#007AFF',
    fontStyle: 'italic',
  },
  helpItem: {
    marginBottom: 16,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  helpText: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
});