import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { ThemedText } from '@/components/ThemedText';
import { Svg, Path } from 'react-native-svg';

interface ThemeToggleProps {
    size?: number;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ size = 24 }) => {
    const { isDarkMode, toggleTheme, theme } = useTheme();

    return (
        <TouchableOpacity
            style={[
                styles.toggleButton,
                {
                    backgroundColor: isDarkMode ? theme.surface : theme.background,
                    ...(Platform.OS === 'ios'
                        ? {
                            boxShadow: `0px 1px 3px ${theme.shadow}`,
                        }
                        : {
                            elevation: 2,
                        }),
                },
            ]}
            onPress={toggleTheme}
            activeOpacity={0.7}
        >
            {isDarkMode ? (
                <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                    <Path
                        d="M12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z"
                        fill="#FFC107"
                    />
                    <Path
                        d="M12 2V4M12 20V22M4 12H2M6.31412 6.31412L4.8999 4.8999M17.6859 6.31412L19.1001 4.8999M6.31412 17.69L4.8999 19.1042M17.6859 17.69L19.1001 19.1042M22 12H20"
                        stroke="#FFC107"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </Svg>
            ) : (
                <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                    <Path
                        d="M21 12.79C20.8427 14.4922 20.2039 16.1144 19.1582 17.4668C18.1126 18.8192 16.7035 19.8458 15.0957 20.4265C13.4879 21.0073 11.7479 21.1181 10.0795 20.7461C8.41113 20.3741 6.8799 19.5345 5.67413 18.3287C4.46835 17.1229 3.62884 15.5917 3.25682 13.9233C2.88479 12.2549 2.99552 10.5148 3.57625 8.90705C4.15698 7.29927 5.18359 5.89013 6.53596 4.84451C7.88834 3.79889 9.51058 3.16014 11.213 3C9.85427 4.76958 9.15305 7.00078 9.2298 9.27615C9.30654 11.5515 10.1539 13.7266 11.6291 15.4128C13.1044 17.099 15.1045 18.0764 17.2426 18.1613C19.3807 18.2463 21.4634 17.4318 23.058 15.89C22.7902 16.9003 22.3343 17.8541 21.7114 18.7C21.4863 18.191 21.0409 17.8016 20.497 17.6391C19.953 17.4766 19.3606 17.556 18.8929 17.8544C18.4251 18.1528 18.1323 18.637 18.0964 19.1676C18.0605 19.6982 18.2847 20.215 18.704 20.562C17.4989 21.1265 16.1769 21.4243 14.843 21.4319C14.9748 20.9211 14.9113 20.372 14.6663 19.9071C14.4213 19.4423 14.0139 19.1001 13.5297 18.9555C13.0454 18.8108 12.5241 18.8762 12.0892 19.1357C11.6544 19.3952 11.3421 19.8282 11.216 20.329C9.93157 20.0808 8.71481 19.5815 7.63806 18.864C7.99597 18.4254 8.12973 17.8527 8.00507 17.3047C7.8804 16.7568 7.50568 16.2908 6.9847 16.0407C6.46372 15.7906 5.8566 15.7791 5.32619 16.0089C4.79577 16.2387 4.40447 16.6883 4.2592 17.229C3.38334 16.0784 2.73571 14.7677 2.35358 13.367C2.88811 13.5728 3.47237 13.5538 3.9893 13.3143C4.50623 13.0747 4.90543 12.6336 5.10093 12.0891C5.29644 11.5446 5.27145 10.946 5.03156 10.4197C4.79167 9.89331 4.35648 9.48473 3.82296 9.28833C4.12064 7.92354 4.69199 6.63238 5.50104 5.48646C5.76252 5.98437 6.20598 6.36486 6.73651 6.54308C7.26704 6.72131 7.84619 6.68443 8.35039 6.43986C8.85459 6.19529 9.24547 5.76348 9.44683 5.23563C9.64818 4.70778 9.64562 4.12521 9.43978 3.59893C10.7474 3.0311 12.1643 2.75729 13.584 2.80002C13.3722 3.28082 13.3553 3.82638 13.5361 4.32033C13.7169 4.81428 14.0811 5.2182 14.5551 5.45828C15.029 5.69836 15.575 5.75467 16.0869 5.61526C16.5987 5.47585 17.0398 5.15021 17.324 4.70002C18.453 5.28499 19.4523 6.08749 20.2693 7.05896C19.9355 7.3969 19.7294 7.84939 19.6881 8.33258C19.6467 8.81578 19.7729 9.29542 20.0442 9.68763C20.3155 10.0798 20.7155 10.3577 21.1733 10.4785C21.631 10.5992 22.1161 10.5551 22.5425 10.353C22.7623 11.1482 22.8846 11.9695 22.906 12.797L21 12.79Z"
                        fill="#5046e4"
                    />
                </Svg>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    toggleButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 999,
    },
});

export default ThemeToggle; 