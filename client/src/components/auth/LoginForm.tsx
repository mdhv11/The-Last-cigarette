import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { login, googleLogin } from '../../store/authSlice';
import { AppDispatch, RootState } from '../../store/store';
import { GoogleAuthProvider, signInWithPopup, getAuth } from 'firebase/auth';
import { auth } from '../../firebaseConfig';


const LoginSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Required'),
    password: Yup.string().required('Required'),
});

export const LoginForm = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { isLoading, error } = useSelector((state: RootState) => state.auth);

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
        },
        validationSchema: LoginSchema,
        onSubmit: (values) => {
            dispatch(login(values));
        },
    });

    const handleGoogleLogin = async () => {
        try {
            const provider = new GoogleAuthProvider();
            // This works for web. For mobile, you'd integrate expo-auth-session
            const result = await signInWithPopup(auth, provider);
            const idToken = await result.user.getIdToken();
            dispatch(googleLogin(idToken));
        } catch (error) {
            // Handle specific firebase errors here if needed
        }
    };

    return (
        <View style={styles.container}>
            <TextInput
                label="Email"
                value={formik.values.email}
                onChangeText={formik.handleChange('email')}
                onBlur={formik.handleBlur('email')}
                error={formik.touched.email && Boolean(formik.errors.email)}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
            />
            <HelperText type="error" visible={formik.touched.email && Boolean(formik.errors.email)}>
                {formik.errors.email}
            </HelperText>

            <TextInput
                label="Password"
                value={formik.values.password}
                onChangeText={formik.handleChange('password')}
                onBlur={formik.handleBlur('password')}
                error={formik.touched.password && Boolean(formik.errors.password)}
                secureTextEntry
                style={styles.input}
            />
            <HelperText type="error" visible={formik.touched.password && Boolean(formik.errors.password)}>
                {formik.errors.password}
            </HelperText>

            {error && <Text style={styles.error}>{error}</Text>}

            <Button mode="contained" onPress={() => formik.handleSubmit()} loading={isLoading} disabled={isLoading} style={styles.button}>
                Login
            </Button>
            <Button mode="outlined" onPress={handleGoogleLogin} loading={isLoading} disabled={isLoading} style={styles.button}>
                Sign in with Google
            </Button>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    input: {
        marginBottom: 5,
    },
    button: {
        marginTop: 10,
    },
    error: {
        color: 'red',
        textAlign: 'center',
        marginBottom: 10,
    },
});
