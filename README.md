# Expo Updates PR Previews Demo

This is a potential flow for having PR previews with Expo/EAS Updates in **bare React Native projects** without the need to build an Expo development build or to use EAS Build.

It is common to have separate production and staging builds as separate apps. If you have a staging build being distributed through Apple TestFlight or Google internal tests, the proposed flow will allow having PR previews in this existing build, without the need of an Expo development build.

The approach used here was based on https://github.com/expo/tito-workflow and as stated there, it is experimental.

Instead of modifying the `app.json` file as suggested in the original, since this is a bare React Native project and I'm not using EAS Build, I had to modify the equivalent keys in `Expo.plist` (iOS) and in the `AndroidManifest.xml` (Android).

Other than that, I simply followed the steps and automated the process in a Github Action that will automatically deploy the update on every new PR, update the branch mapping for the given update channel and generate a deep link including the branch override param.

Then the app has some logic to handle this deep link. It will call `setExtraParamAsync` with the branch override param from the deep link and fetch the update.
