import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AppError } from '../utils/errorHandling';

interface ErrorDisplayProps {
  error: AppError | string | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  compact?: boolean;
  showIcon?: boolean;
}

/**
 * Comprehensive error display component with retry functionality
 */
export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  onDismiss,
  compact = false,
  showIcon = true,
}) => {
  if (!error) return null;

  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorCode = typeof error === 'object' ? error.code : undefined;

  const getErrorIcon = () => {
    if (!showIcon) return null;

    if (errorCode === 'NETWORK_ERROR') return '📡';
    if (errorCode === 'UNAUTHORIZED') return '🔒';
    if (errorCode === 'SERVER_ERROR') return '⚠️';
    return '❌';
  };

  const getErrorColor = () => {
    if (errorCode === 'NETWORK_ERROR') return '#FF9800';
    if (errorCode === 'UNAUTHORIZED') return '#F44336';
    return '#D32F2F';
  };

  if (compact) {
    return (
      <View style={[styles.compactContainer, { borderLeftColor: getErrorColor() }]}>
        {showIcon && <Text style={styles.compactIcon}>{getErrorIcon()}</Text>}
        <Text style={styles.compactMessage}>{errorMessage}</Text>
        {onRetry && (
          <TouchableOpacity onPress={onRetry} style={styles.compactRetry}>
            <Text style={styles.compactRetryText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: `${getErrorColor()}15` }]}>
      <View style={styles.header}>
        {showIcon && <Text style={styles.icon}>{getErrorIcon()}</Text>}
        <Text style={[styles.message, { color: getErrorColor() }]}>
          {errorMessage}
        </Text>
      </View>

      {(onRetry || onDismiss) && (
        <View style={styles.actions}>
          {onRetry && (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: getErrorColor() }]}
              onPress={onRetry}
            >
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
          )}
          {onDismiss && (
            <TouchableOpacity
              style={[styles.button, styles.dismissButton]}
              onPress={onDismiss}
            >
              <Text style={[styles.buttonText, { color: getErrorColor() }]}>
                Dismiss
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  message: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    minWidth: 100,
    alignItems: 'center',
  },
  dismissButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 6,
    borderLeftWidth: 4,
    marginVertical: 8,
  },
  compactIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  compactMessage: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  compactRetry: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  compactRetryText: {
    color: '#FF9800',
    fontSize: 14,
    fontWeight: '600',
  },
});
