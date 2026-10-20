import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Platform,
  Linking,
} from 'react-native';
import { Ionicons } from '../components/AppIcon';
import { COLORS, SPACING } from '../constants/theme';

let VideoComponent = null;
let ResizeModeObj = {};
if (Platform.OS !== 'web') {
  try {
    const ExpoAv = require('expo-av');
    VideoComponent = ExpoAv.Video;
    ResizeModeObj = ExpoAv.ResizeMode || {};
  } catch (err) {
    console.warn('Cannot load expo-av on this platform:', err);
  }
}

export default function TrailerPlayerScreen({ route, navigation }) {
  const { title, trailerUrl } = route.params || {};
  const videoRef = useRef(null);
  const [status, setStatus] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleOpenBrowser = () => {
    if (trailerUrl) {
      Linking.openURL(trailerUrl);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="close" size={24} color={COLORS.textLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title || 'Video Trailer'}
        </Text>
        <TouchableOpacity
          style={styles.browserBtn}
          onPress={handleOpenBrowser}
          activeOpacity={0.8}
        >
          <Ionicons name="open-outline" size={20} color={COLORS.textLight} />
        </TouchableOpacity>
      </View>

      {/* Video Container */}
      <View style={styles.playerContainer}>
        {Platform.OS === 'web' ? (
          <View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
            <video
              src={trailerUrl}
              controls
              autoPlay
              style={{ width: '100%', maxHeight: '450px', backgroundColor: '#000' }}
            />
          </View>
        ) : VideoComponent ? (
          <>
            <VideoComponent
              ref={videoRef}
              style={styles.video}
              source={{ uri: trailerUrl }}
              useNativeControls
              resizeMode={ResizeModeObj.CONTAIN || 'contain'}
              isLooping={false}
              shouldPlay
              onPlaybackStatusUpdate={(s) => {
                setStatus(() => s);
                if (s.isLoaded) setIsLoading(false);
                if (s.error) {
                  setHasError(true);
                  setIsLoading(false);
                }
              }}
              onError={(e) => {
                console.error('Video error:', e);
                setHasError(true);
                setIsLoading(false);
              }}
            />

            {isLoading && !hasError && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.bufferingText}>Đang tải video trailer...</Text>
              </View>
            )}

            {hasError && (
              <View style={styles.errorOverlay}>
                <Ionicons name="alert-circle-outline" size={48} color={COLORS.danger} />
                <Text style={styles.errorTitle}>Không thể phát video</Text>
                <Text style={styles.errorSub}>Định dạng video không được hỗ trợ hoặc link bị gián đoạn.</Text>
                <TouchableOpacity style={styles.openLinkBtn} onPress={handleOpenBrowser}>
                  <Text style={styles.openLinkBtnText}>Mở bằng trình duyệt ngoài</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : null}
      </View>

      {/* Footer Info */}
      <View style={styles.infoFooter}>
        <Text style={styles.urlLabel}>Đường dẫn Trailer:</Text>
        <Text style={styles.urlText} numberOfLines={2}>
          {trailerUrl}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0E17',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  browserBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textLight,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  playerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bufferingText: {
    color: COLORS.textLight,
    marginTop: 12,
    fontSize: 14,
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 14, 23, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  errorTitle: {
    color: COLORS.textLight,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
  },
  errorSub: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 16,
  },
  openLinkBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  openLinkBtnText: {
    color: COLORS.textLight,
    fontWeight: '600',
    fontSize: 14,
  },
  infoFooter: {
    padding: SPACING.md,
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  urlLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
  },
  urlText: {
    fontSize: 13,
    color: '#94A3B8',
  },
});
