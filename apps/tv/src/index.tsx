/**
 * CommonScene TV Application — React Native entry point.
 *
 * Registers the root component with the Vega OS runtime.
 * The AppRegistry name must match the `name` field in app.json.
 */
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from '../app.json';

AppRegistry.registerComponent(appName, () => App);
