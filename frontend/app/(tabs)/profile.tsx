import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../../store/useStore';

export default function Profile() {
  const { stats } = useStore();

  const settingsOptions = [
    {
      icon: 'person-outline',
      title: 'الملف الشخصي',
      subtitle: 'عدّل معلوماتك الشخصية',
      color: '#3b82f6',
    },
    {
      icon: 'notifications-outline',
      title: 'الإشعارات',
      subtitle: 'إدارة التنبيهات والتذكيرات',
      color: '#f59e0b',
    },
    {
      icon: 'color-palette-outline',
      title: 'المظهر',
      subtitle: 'تخصيص شكل التطبيق',
      color: '#8b5cf6',
    },
    {
      icon: 'language-outline',
      title: 'اللغة',
      subtitle: 'العربية',
      color: '#22c55e',
    },
  ];

  const aboutOptions = [
    {
      icon: 'help-circle-outline',
      title: 'مركز المساعدة',
      color: '#6b7280',
    },
    {
      icon: 'document-text-outline',
      title: 'سياسة الخصوصية',
      color: '#6b7280',
    },
    {
      icon: 'information-circle-outline',
      title: 'حول التطبيق',
      color: '#6b7280',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>الملف الشخصي</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color="#fff" />
            </View>
            <TouchableOpacity style={styles.editAvatarButton}>
              <Ionicons name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>مستخدم</Text>
          <Text style={styles.userEmail}>user@example.com</Text>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>إحصائياتي</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="trophy" size={32} color="#f59e0b" />
              <Text style={styles.statValue}>{stats?.completion_rate || 0}%</Text>
              <Text style={styles.statLabel}>معدل الإنجاز</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="flame" size={32} color="#ef4444" />
              <Text style={styles.statValue}>{stats?.total_streak || 0}</Text>
              <Text style={styles.statLabel}>سلسلة العادات</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="checkbox" size={32} color="#22c55e" />
              <Text style={styles.statValue}>{stats?.completed_tasks || 0}</Text>
              <Text style={styles.statLabel}>مهام مكتملة</Text>
            </View>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الإعدادات</Text>
          {settingsOptions.map((option, index) => (
            <TouchableOpacity key={index} style={styles.optionCard}>
              <View style={styles.optionLeft}>
                <View
                  style={[styles.optionIcon, { backgroundColor: option.color + '20' }]}
                >
                  <Ionicons name={option.icon as any} size={24} color={option.color} />
                </View>
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  {option.subtitle && (
                    <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                  )}
                </View>
              </View>
              <Ionicons name="chevron-back" size={20} color="#9ca3af" />
            </TouchableOpacity>
          ))}
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>حول التطبيق</Text>
          {aboutOptions.map((option, index) => (
            <TouchableOpacity key={index} style={styles.optionCard}>
              <View style={styles.optionLeft}>
                <View
                  style={[styles.optionIcon, { backgroundColor: '#f3f4f6' }]}
                >
                  <Ionicons name={option.icon as any} size={24} color={option.color} />
                </View>
                <Text style={styles.optionTitle}>{option.title}</Text>
              </View>
              <Ionicons name="chevron-back" size={20} color="#9ca3af" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Version */}
        <Text style={styles.version}>Smart Life Assistant v1.0.0</Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  profileCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
  },
  statsCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'right',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e5e7eb',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    paddingHorizontal: 20,
    textAlign: 'right',
  },
  optionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'right',
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
    textAlign: 'right',
  },
  version: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 8,
  },
});
