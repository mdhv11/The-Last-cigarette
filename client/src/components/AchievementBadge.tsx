import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface AchievementBadgeProps {
  icon: string;
  title: string;
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  icon,
  title,
  size = 'medium',
  onPress,
}) => {
  const containerStyle = [
    styles.container,
    size === 'small' && styles.containerSmall,
    size === 'large' && styles.containerLarge,
  ];

  const iconStyle = [
    styles.icon,
    size === 'small' && styles.iconSmall,
    size === 'large' && styles.iconLarge,
  ];

  const titleStyle = [
    styles.title,
    size === 'small' && styles.titleSmall,
    size === 'large' && styles.titleLarge,
  ];

  const content = (
    <View style={containerStyle}>
      <Text style={iconStyle}>{icon}</Text>
      <Text style={titleStyle} numberOfLines={1}>
        {title}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  containerSmall: {
    padding: 8,
    minWidth: 60,
    borderRadius: 8,
  },
  containerLarge: {
    padding: 16,
    minWidth: 100,
    borderRadius: 16,
  },
  icon: {
    fontSize: 32,
    marginBottom: 4,
  },
  iconSmall: {
    fontSize: 24,
    marginBottom: 2,
  },
  iconLarge: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
    textAlign: 'center',
  },
  titleSmall: {
    fontSize: 10,
  },
  titleLarge: {
    fontSize: 14,
  },
});
