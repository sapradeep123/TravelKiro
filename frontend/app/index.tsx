import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Travel Encyclopedia</Text>
      <Text style={styles.subtitle}>Your Gateway to World Exploration</Text>
      <Button mode="contained" style={styles.button}>
        Get Started
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  button: {
    marginTop: 20,
  },
});
