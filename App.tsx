import React, {useEffect} from 'react';

import {
  Alert,
  Button,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Linking,
} from 'react-native';

import urlParse from 'url-parse';

import * as Updates from 'expo-updates';

function App(): React.JSX.Element {
  const {currentlyRunning} = Updates.useUpdates();
  const [lastLinkingUrl, setLastLinkingUrl] = React.useState<string | null>(
    null,
  );

  const getInitialUrl = async () => {
    try {
      setLastLinkingUrl('...');
      const url = await Linking.getInitialURL();
      console.log('Initial URL:', url);

      setLastLinkingUrl(url);

      return url;
    } catch (error: any) {
      setLastLinkingUrl(null);
      Alert.alert('getInitialUrl ERROR', error.message ?? error);
      return null;
    }
  };

  useEffect(() => {
    getInitialUrl();
  }, []);

  const handleExpoUpdatesLink = async (deepLink: string) => {
    try {
      const parsedUrl = urlParse(deepLink, true);

      const {expoUpdatesBranch} = parsedUrl.query;

      if (!expoUpdatesBranch) {
        return;
      }

      console.log('expoUpdatesBranch', expoUpdatesBranch);

      if (__DEV__) {
        Alert.alert(
          'Development Mode',
          `We can't handle your update link for ${expoUpdatesBranch} in development mode.`,
        );

        return;
      }

      await Updates.setExtraParamAsync('branch-override', expoUpdatesBranch);

      await Updates.fetchUpdateAsync();

      await Updates.reloadAsync();
    } catch (error: any) {
      console.error('handleExpoUpdatesLink ERROR:', error.message ?? error);
      Alert.alert('handleExpoUpdatesLink ERROR', error.message ?? error);
    }
  };

  useEffect(() => {
    const subscription = Linking.addEventListener('url', event => {
      console.log('Linking event:', event);
      const url = event.url;
      setLastLinkingUrl(url);

      if (url?.includes('expo-updates-preview')) {
        handleExpoUpdatesLink(url);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);
  return (
    <SafeAreaView style={styles.backgroundStyle}>
      <StatusBar barStyle={'dark-content'} backgroundColor={'white'} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={styles.backgroundStyle}
        contentContainerStyle={styles.scrollContentContainer}>
        <View style={styles.section}>
          <Text
            style={[
              styles.regularText,
              {textAlign: 'center', color: 'green', fontWeight: 'bold'},
            ]}>
            Should be visible in the testing-4 branch PR preview.
          </Text>
          <Text style={styles.titleText}>Debug Info</Text>
          <Text style={styles.regularText}>
            Last linking URL: {`${lastLinkingUrl}`}
          </Text>
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
          <Text style={styles.titleText}>Methods</Text>

          <Button
            title="Linking.getInitialUrl"
            onPress={async () => {
              try {
                const url = await Linking.getInitialURL();
                Alert.alert('getInitialUrl', `${url}`);
              } catch (error: any) {
                Alert.alert('getInitialUrl ERROR', error.message ?? error);
              }
            }}
          />

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

          <Button
            title="setExtraParamsAsync - branch-override: test-1"
            onPress={async () => {
              try {
                await Updates.setExtraParamAsync('branch-override', 'test-1');
                Alert.alert('Success', 'branch-override is now test-1');
              } catch (error: any) {
                Alert.alert('setExtraParamAsync ERROR', error.message ?? error);
              }
            }}
          />

          <Button
            title="setExtraParamsAsync - unset branch-override"
            onPress={async () => {
              try {
                await Updates.setExtraParamAsync('branch-override', null);
                Alert.alert('Success', 'branch-override is now removed');
              } catch (error: any) {
                Alert.alert('setExtraParamAsync ERROR', error.message ?? error);
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
