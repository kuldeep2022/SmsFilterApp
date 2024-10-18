import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  NativeModules,
  PermissionsAndroid,
  Alert,
  DeviceEventEmitter,
  StyleSheet,
  Platform,
  Button,
} from 'react-native';
import PushNotification, {Importance} from 'react-native-push-notification';
import notifee, {
  AndroidCategory,
  AndroidFlags,
  AndroidImportance,
  AndroidVisibility,
} from '@notifee/react-native';

const App = () => {
  const [receiveSmsPermission, setReceiveSmsPermission] = useState('');
  const [hasNotificationPermission, setHasNotificationPermission] =
    useState(false);

  const requestSmsPermission = async () => {
    try {
      const permission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
      );
      setReceiveSmsPermission(permission);
    } catch (err) {
      console.log(err);
    }
  };

  const requestNotificationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        setHasNotificationPermission(
          granted === PermissionsAndroid.RESULTS.GRANTED,
        );
      } catch (err) {
        console.error('Error requesting notification permission', err);
      }
    }
  };

  async function onDisplayNotification() {
    // Request permissions (required for iOS)
    await notifee.requestPermission();
    notifee.displayNotification({
      title: `senderPhoneNumber}`,
      body: `messageBody}`,

      android: {
        channelId: 'p1-sms-channel',
        pressAction: {
          id: 'default',
        },
        timestamp: Date.now(), // 8 minutes ago
        color: '#4caf50',
        showTimestamp: true,
        category: AndroidCategory.CALL,
        importance: AndroidImportance.HIGH,
        fullScreenAction: {
          id: 'default',
        },
        loopSound: true,
      },
    });
    // Create a channel (required for Android)
  }

  useEffect(() => {
    requestSmsPermission();
    notifee.createChannel({
      id: 'p1-sms-channel',
      name: 'Default Channel',
      lights: true,
      vibration: true,
      importance: AndroidImportance.HIGH,
      sound: 'default',
      visibility: AndroidVisibility.PUBLIC,
      bypassDnd: true,
      badge: true,
    });
  }, []);

  useEffect(() => {
    PushNotification.getChannels(function (channel_ids) {
      console.log(channel_ids); // ['channel_id_1']
    });
    if (receiveSmsPermission === PermissionsAndroid.RESULTS.GRANTED) {
      let subscriber = DeviceEventEmitter.addListener(
        'onSMSReceived',
        message => {
          const {messageBody, senderPhoneNumber} = JSON.parse(message);
          console.log('Notification permission: ', hasNotificationPermission);

          if (senderPhoneNumber === '469' && messageBody.includes('P1')) {
            console.log('Before Notification');
            try {
              notifee.displayNotification({
                title: `${senderPhoneNumber}`,
                body: `${messageBody}`,

                android: {
                  channelId: 'p1-sms-channel',
                  pressAction: {
                    id: 'default',
                  },
                  timestamp: Date.now(), // 8 minutes ago
                  color: '#4caf50',
                  showTimestamp: true,
                  category: AndroidCategory.CALL,
                  importance: AndroidImportance.HIGH,
                  fullScreenAction: {
                    id: 'default',
                  },
                  loopSound: true,
                },
              });

              console.log('Notification triggered');
            } catch (error) {
              console.error('Error triggering notification:', error);
            }
            console.log('After Notification');
          }
        },
      );

      return () => {
        subscriber.remove();
      };
    }
  }, [receiveSmsPermission, hasNotificationPermission]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <Text style={styles.titleText}>
          This App will filter the SMS messages received for P1 calls for GSIP
        </Text>
        <Button
          title="Request Notification Permission"
          onPress={requestNotificationPermission}
        />
        <Text>
          Notification permission:{' '}
          {hasNotificationPermission ? 'Granted' : 'Denied'}
        </Text>
        <Button
          title="Display Notification"
          onPress={() => onDisplayNotification()}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 20,
    color: 'black',
    fontWeight: 'bold',
  },
});
export default App;
