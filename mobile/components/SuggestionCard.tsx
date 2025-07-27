import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface SuggestionCardProps {
  suggestion: {
    original: string;
    suggestion: string;
    confidence: number;
    explanation?: string;
  };
  onAccept: () => void;
  onReject: () => void;
  getConfidenceColor: (confidence: number) => string;
  getConfidenceLabel: (confidence: number) => string;
}

export function SuggestionCard({
  suggestion,
  onAccept,
  onReject,
  getConfidenceLabel,
}: SuggestionCardProps) {
  const getConfidenceStyle = (confidence: number) => {
    if (confidence >= 0.8) return styles.confidenceHigh;
    if (confidence >= 0.6) return styles.confidenceMedium;
    return styles.confidenceLow;
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.suggestionRow}>
          <Text style={styles.original}>"{suggestion.original}"</Text>
          <Text style={styles.arrow}> → </Text>
          <Text style={styles.suggested}>"{suggestion.suggestion}"</Text>
          <View style={[styles.confidenceBadge, getConfidenceStyle(suggestion.confidence)]}>
            <Text style={styles.confidenceText}>
              {getConfidenceLabel(suggestion.confidence)}
            </Text>
          </View>
        </View>
        {suggestion.explanation && (
          <Text style={styles.explanation}>{suggestion.explanation}</Text>
        )}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={onReject} style={styles.rejectButton}>
          <Text style={styles.rejectText}>Reject</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onAccept} style={styles.acceptButton}>
          <Text style={styles.acceptText}>Accept</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    marginVertical: 4,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  content: {
    flex: 1,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  original: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6c757d',
  },
  arrow: {
    fontSize: 14,
    color: '#6c757d',
  },
  suggested: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212529',
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  confidenceHigh: {
    backgroundColor: '#d4edda',
  },
  confidenceMedium: {
    backgroundColor: '#fff3cd',
  },
  confidenceLow: {
    backgroundColor: '#f8d7da',
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#495057',
  },
  explanation: {
    fontSize: 12,
    color: '#6c757d',
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 12,
  },
  rejectButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#dee2e6',
    backgroundColor: '#fff',
  },
  rejectText: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
  },
  acceptButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#007AFF',
  },
  acceptText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
});