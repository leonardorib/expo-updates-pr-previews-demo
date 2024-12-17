import React from 'react';

import {
  Alert,
  Button,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import * as Updates from 'expo-updates';

function App(): React.JSX.Element {
  const {currentlyRunning} = Updates.useUpdates();
  return (
    <SafeAreaView style={styles.backgroundStyle}>
      <StatusBar barStyle={'dark-content'} backgroundColor={'white'} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={styles.backgroundStyle}
        contentContainerStyle={styles.scrollContentContainer}>
        <View style={styles.section}>
          <Text style={styles.titleText}>Expo Updates Constants</Text>
          <Text style={styles.regularText}>
            Updates.isEnabled: {`${Updates.isEnabled}`}
          </Text>
          <Text style={styles.regularText}>
            Updates.channel: {`${Updates.channel}`}
          </Text>
          <Text style={styles.regularText}>
            Updates.updateId: {`${Updates.updateId}`}
          </Text>
          <Text style={styles.regularText}>
            Updates.checkAutomatically: {`${Updates.checkAutomatically}`}
          </Text>
          <Text style={styles.regularText}>
            Updates.createdAt: {`${Updates.createdAt}`}
          </Text>
          <Text style={styles.regularText}>
            Updates.isEmbeddedLaunch: {`${Updates.isEmbeddedLaunch}`}
          </Text>
        </View>

        <View style={styles.spacer} />

        <View style={styles.section}>
          <Text style={styles.titleText}>Expo Updates Methods</Text>

          <Button
            title="currentlyRunning"
            onPress={() => {
              Alert.alert(
                'currentlyRunning',
                `${
                  currentlyRunning
                    ? JSON.stringify(currentlyRunning, null, 2)
                    : 'N/A'
                }`,
              );
            }}
          />

          <Button
            title="checkForUpdateAsync"
            onPress={async () => {
              try {
                const update = await Updates.checkForUpdateAsync();
                Alert.alert(
                  'checkForUpdateAsync',
                  JSON.stringify(update, null, 2),
                );
              } catch (error: any) {
                Alert.alert(
                  'checkForUpdateAsync ERROR',
                  error.message ?? error,
                );
              }
            }}
          />

          <Button
            title="fetchUpdateAsync"
            onPress={async () => {
              try {
                const update = await Updates.fetchUpdateAsync();
                Alert.alert(
                  'fetchUpdateAsync',
                  JSON.stringify(update, null, 2),
                );
              } catch (error: any) {
                Alert.alert('fetchUpdateAsync ERROR', error.message ?? error);
              }
            }}
          />

          <Button
            title="reloadAsync"
            onPress={async () => {
              try {
                await Updates.reloadAsync();
              } catch (error: any) {
                Alert.alert('reloadAsync ERROR', error.message ?? error);
              }
            }}
          />

          <Button
            title="clearLogEntriesAsync"
            onPress={async () => {
              try {
                await Updates.clearLogEntriesAsync();

                Alert.alert('clearLogEntriesAsync', 'Logs cleared');
              } catch (error: any) {
                Alert.alert(
                  'clearLogEntriesAsync ERROR',
                  error.message ?? error,
                );
              }
            }}
          />

          <Button
            title="readLogEntriesAsync"
            onPress={async () => {
              try {
                const logs = await Updates.readLogEntriesAsync();
                Alert.alert(
                  'readLogEntriesAsync',
                  logs.map(log => JSON.stringify(log, null, 2)).join('\n\n'),
                );
              } catch (error: any) {
                Alert.alert(
                  'readLogEntriesAsync ERROR',
                  error.message ?? error,
                );
              }
            }}
          />

          <Button
            title="getExtraParamsAsync"
            onPress={async () => {
              try {
                const extra = await Updates.getExtraParamsAsync();
                Alert.alert(
                  'getExtraParamsAsync',
                  extra ? JSON.stringify(extra, null, 2) : 'N/A',
                );
              } catch (error: any) {
                Alert.alert(
                  'getExtraParamsAsync ERROR',
                  error.message ?? error,
                );
              }
            }}
          />
        </View>

        <View style={styles.spacer} />

        <View style={styles.section}>
          <Text style={styles.regularText}>
            __DEV__: {__DEV__ ? 'true' : 'false'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backgroundStyle: {
    backgroundColor: 'white',
    flex: 1,
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },
  regularText: {
    fontSize: 16,
    color: 'black',
  },
  scrollContentContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  spacer: {
    height: 40,
  },
  section: {
    gap: 12,
    alignItems: 'center',
  },
});

export default App;
