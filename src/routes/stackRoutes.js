import React from 'react';
import { createNativeStackNavigator} from '@react-navigation/native-stack';

import LoginScreen from '../loginScreen';

const Stack = createNativeStackNavigator();

function StackRoutes(){
    return(
        <Stack.Navigator>
            <Stack.Screen 
                name="LoginScreen"
                component={LoginScreen}
                options={{
                    headerShown: false,
                    drawerShown: false,
                }}
            />
        </Stack.Navigator>
    )
}

export default StackRoutes;