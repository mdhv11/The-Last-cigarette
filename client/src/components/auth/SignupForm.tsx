import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { signup } from '../../store/authSlice';
import { AppDispatch, RootState } from '../../store/store';

const SignupSchema = Yup.object().shape({
    name: Yup.string().required('Required'),
    email: Yup.string().email('Invalid email').required('Required'),
    password: Yup.string().min(6, 'Too Short!').required('Required'),
});

export const SignupForm = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { isLoading, error } = useSelector((state: RootState) => state.auth);

    const formik = useFormik({
        initialValues: {
            name: '',
            email: '',
            password: '',
        },
        validationSchema: SignupSchema,
        onSubmit: (values) => {
            dispatch(signup(values));
        },
    });

    return (
        <View style={styles.container}>
            <TextInput
                label="Name"
                value={formik.values.name}
                onChangeText={formik.handleChange('name')}
                onBlur={formik.handleBlur('name')}
                error={formik.touched.name && Boolean(formik.errors.name)}
                style={styles.input}
            />
            <HelperText type="error" visible={formik.touched.name && Boolean(formik.errors.name)}>
                {formik.errors.name}
            </HelperText>

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
                Sign Up
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
