import React, { useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, PanResponder } from 'react-native';
import PagerView, { PagerViewOnPageSelectedEvent } from 'react-native-pager-view';
import LaunchScreen1 from './launchScreen1';
import LaunchScreen2 from './launchScreen2';
import LaunchScreen3 from './launchScreen3';
import LoginScreen from './loginScreen';

const { width: screenWidth } = Dimensions.get('window');

interface SwipableLoginScreensProps {
    // Permettre de passer des props si nécessaire
}

export default function SwipableLoginScreens(props: SwipableLoginScreensProps) {
    const pagerRef = useRef<PagerView>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const handlePageSelected = (e: PagerViewOnPageSelectedEvent) => {
        setCurrentPage(e.nativeEvent.position);
        setIsTransitioning(false);
    };

    const goToNextPage = () => {
        if (currentPage < 3 && !isTransitioning) {
            setIsTransitioning(true);
            pagerRef.current?.setPage(currentPage + 1);
        }
    };

    const goToPreviousPage = () => {
        if (currentPage > 0 && !isTransitioning) {
            setIsTransitioning(true);
            pagerRef.current?.setPage(currentPage - 1);
        }
    };

    const goToPage = (page: number) => {
        if (page >= 0 && page <= 3 && !isTransitioning) {
            setIsTransitioning(true);
            pagerRef.current?.setPage(page);
        }
    };

    // PanResponder pour gérer les gestes de swipe
    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => !isTransitioning,
        onMoveShouldSetPanResponder: (evt, gestureState) => {
            // Seulement si le mouvement horizontal est plus important que le vertical
            return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 20;
        },
        onPanResponderMove: () => {
            // Ne rien faire pendant le mouvement
        },
        onPanResponderRelease: (evt, gestureState) => {
            if (isTransitioning) return;

            const { dx, vx } = gestureState;
            const threshold = 50; // Seuil minimum pour déclencher la navigation
            const velocityThreshold = 0.3; // Seuil de vélocité

            // Swipe de droite à gauche (vers la page suivante)
            if ((dx < -threshold || vx < -velocityThreshold) && currentPage < 3) {
                goToNextPage();
            }
            // Swipe de gauche à droite (vers la page précédente)
            else if ((dx > threshold || vx > velocityThreshold) && currentPage > 0) {
                goToPreviousPage();
            }
        },
    });

    return (
        <View style={styles.container}>
            <View {...panResponder.panHandlers} style={styles.gestureContainer}>
                <PagerView
                    ref={pagerRef}
                    style={styles.pagerView}
                    initialPage={0}
                    onPageSelected={handlePageSelected}
                    orientation="horizontal"
                    scrollEnabled={false}
                    pageMargin={0}
                    offscreenPageLimit={1}
                    keyboardDismissMode="on-drag"
                    overScrollMode="never"
                >
                    {/* Page 0: Launch Screen 1 */}
                    <View key="0" style={styles.page}>
                        <LaunchScreen1
                            onNext={goToNextPage}
                            onSkipToLogin={() => goToPage(3)}
                            canGoNext={true}
                        />
                    </View>

                    {/* Page 1: Launch Screen 2 */}
                    <View key="1" style={styles.page}>
                        <LaunchScreen2
                            onNext={goToNextPage}
                            onPrevious={goToPreviousPage}
                            onSkipToLogin={() => goToPage(3)}
                            canGoNext={true}
                            canGoPrevious={true}
                        />
                    </View>

                    {/* Page 2: Launch Screen 3 */}
                    <View key="2" style={styles.page}>
                        <LaunchScreen3
                            onNext={goToNextPage}
                            onPrevious={goToPreviousPage}
                            onSkipToLogin={() => goToPage(3)}
                            canGoNext={true}
                            canGoPrevious={true}
                        />
                    </View>

                    {/* Page 3: Login Screen */}
                    <View key="3" style={styles.page}>
                        <LoginScreen
                            onPrevious={goToPreviousPage}
                            canGoPrevious={true}
                        />
                    </View>
                </PagerView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gestureContainer: {
        flex: 1,
    },
    pagerView: {
        flex: 1,
    },
    page: {
        flex: 1,
        width: screenWidth,
    },
});
