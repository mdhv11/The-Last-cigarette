# Craving SOS Features

## Overview

The Craving SOS system provides immediate support tools to help users resist smoking cravings. It's accessible from the home screen and offers multiple evidence-based techniques.

## Components

### 1. CravingSOS (Main Component)

The main modal that displays when users need craving support.

**Features:**
- Motivational quotes randomly selected from a curated list
- User progress display (days since start, money saved, cigarettes avoided)
- Quick access to breathing exercises and delay timer
- Quick tips for immediate distraction techniques
- Modal presentation for full-screen focus

**Usage:**
```tsx
import { CravingSOS } from '../components';

<CravingSOS
  visible={sosVisible}
  onClose={() => setSOSVisible(false)}
  userProgress={{
    daysSinceStart: 15,
    moneySaved: 75.50,
    cigarettesAvoided: 150
  }}
/>
```

### 2. BreathingExercise

Guided breathing exercise with visual feedback using an animated circle.

**Features:**
- 4-phase breathing cycle: Inhale (4s) → Hold (4s) → Exhale (4s) → Rest (2s)
- Animated circle that expands/contracts with breathing
- Cycle counter to track progress
- Recommended 5 cycles for best results
- Visual and textual guidance

**Breathing Pattern:**
- **Inhale**: 4 seconds (circle expands, green color)
- **Hold**: 4 seconds (circle stays expanded, green color)
- **Exhale**: 4 seconds (circle contracts, blue color)
- **Rest**: 2 seconds (circle stays contracted, blue color)

**Usage:**
```tsx
import { BreathingExercise } from '../components';

<BreathingExercise
  onComplete={() => console.log('Exercise completed')}
/>
```

### 3. DelayTimer

10-minute countdown timer to help users delay smoking.

**Features:**
- Configurable duration (default 10 minutes)
- Visual progress ring showing time elapsed
- Motivational messages that change based on progress
- Pause/Resume functionality
- Reset option
- Completion celebration
- Educational information about why delaying works

**Motivational Messages:**
- 0-25%: "You've got this! Just a few minutes."
- 25-50%: "Great job! You're doing amazing!"
- 50-75%: "More than halfway there! Keep going!"
- 75-100%: "Almost done! You're so strong!"
- 100%: "You did it! Craving conquered!"

**Usage:**
```tsx
import { DelayTimer } from '../components';

<DelayTimer
  defaultMinutes={10}
  onComplete={() => console.log('Timer completed')}
  onCancel={() => console.log('Timer cancelled')}
/>
```

## Integration

### Home Screen Integration

The SOS button is prominently displayed on the home screen for easy access:

```tsx
<TouchableOpacity
  style={styles.sosButton}
  onPress={() => setSOSVisible(true)}
>
  <Text style={styles.sosButtonIcon}>🆘</Text>
  <Text style={styles.sosButtonText}>Need Help with Cravings?</Text>
</TouchableOpacity>
```

## Evidence-Based Techniques

### 1. Breathing Exercises
- Activates the parasympathetic nervous system
- Reduces stress and anxiety
- Provides immediate distraction
- Improves oxygen flow

### 2. Delay Technique
- Most cravings peak and pass within 10 minutes
- Breaking the automatic response pattern
- Building willpower through small victories
- Proving self-control capability

### 3. Motivational Reminders
- Reinforces reasons for quitting
- Shows tangible progress
- Builds self-efficacy
- Maintains focus on goals

## Quick Tips Provided

1. 💧 Drink a glass of water
2. 🚶 Take a short walk
3. 📞 Call a supportive friend
4. 🍎 Eat a healthy snack
5. 🎵 Listen to your favorite music

## Future Enhancements

Potential additions for future versions:
- [ ] Log craving events for pattern analysis
- [ ] Customizable motivational quotes
- [ ] Integration with journal for craving triggers
- [ ] Progressive muscle relaxation exercise
- [ ] Guided meditation audio
- [ ] Emergency contact quick dial
- [ ] Craving intensity tracking over time
- [ ] Success rate statistics
