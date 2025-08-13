# Admin System Documentation

## Overview

The admin system provides comprehensive platform management capabilities with Role-Based Access Control (RBAC), feature management, user administration, and real-time monitoring. This system is designed to give administrators full control over the platform while maintaining security and audit trails.

## Features

### 1. Admin Dashboard
- **Real-time Statistics**: View platform health, user counts, and system metrics
- **System Health Monitoring**: Database, blockchain, and WebSocket connectivity status
- **Action History**: Track all admin actions with detailed logs
- **User Distribution**: Visual breakdown of user statuses (Standard, On-Chain Unlinked, Pro Linked)
- **Admin User Management**: View admin users by role and activity status

### 2. User Management
- **Comprehensive User View**: Detailed user information including status, features, and admin notes
- **Admin Actions**: Force link/unlink profiles, grant premium access, add notes
- **Search and Filter**: Find users by wallet address, status, or profile handle
- **Pagination**: Efficient browsing of large user lists
- **Feature Access Management**: Grant or revoke feature access for individual users

### 3. Role-Based Access Control (RBAC)
- **Admin Roles**:
  - **SuperAdmin**: Full access to all features and actions
  - **SupportAgent**: Limited access for customer support tasks
  - **Auditor**: Read-only access for compliance and auditing
  - **Moderator**: Content moderation and basic user management

- **Permissions**:
  - `user.force_unlink`: Force unlink user profiles
  - `user.force_link`: Force link user profiles
  - `user.grant_premium`: Grant premium access
  - `user.add_note`: Add admin notes to users
  - `feature.manage`: Manage feature access controls
  - `feature.create`: Create new features

### 4. Feature Management
- **Feature Creation**: Create new features with access controls
- **Access Control Configuration**: Set standard, premium, and admin override access
- **Category Management**: Organize features by categories
- **User Access Management**: Grant or revoke feature access for specific users
- **Feature Status**: Activate/deactivate features

### 5. Notification System
- **Real-time Notifications**: WebSocket-based notifications for admin actions
- **User Notifications**: Automatic notifications to users when their status changes
- **Action Confirmations**: Immediate feedback for admin actions

### 6. Audit Trail
- **Action Logging**: All admin actions are logged with timestamps and reasons
- **Admin Attribution**: Each action is attributed to the admin who performed it
- **Status Tracking**: Track action status (Pending, Completed, Failed, Cancelled)
- **Error Logging**: Detailed error messages for failed actions

## Database Schema

### Admin Models

#### AdminUser
```sql
- id: String (Primary Key)
- walletAddress: String (Unique)
- email: String (Unique)
- username: String (Unique)
- displayName: String?
- role: AdminRole (SuperAdmin, SupportAgent, Auditor, Moderator)
- isActive: Boolean
- lastLoginAt: DateTime?
- createdAt: DateTime
- updatedAt: DateTime
```

#### AdminPermission
```sql
- id: String (Primary Key)
- adminUserId: String (Foreign Key)
- permission: String
- grantedAt: DateTime
- grantedBy: String (Admin wallet address)
```

#### AdminAction
```sql
- id: String (Primary Key)
- adminUserId: String (Foreign Key)
- actionType: AdminActionType
- targetWallet: String
- targetProfileId: String?
- reason: String
- metadata: Json?
- status: AdminActionStatus
- result: Json?
- errorMessage: String?
- createdAt: DateTime
- completedAt: DateTime?
```

#### AdminNote
```sql
- id: String (Primary Key)
- adminUserId: String (Foreign Key)
- walletAddress: String (Foreign Key)
- note: String
- isPrivate: Boolean
- createdAt: DateTime
- updatedAt: DateTime
```

#### Feature
```sql
- id: String (Primary Key)
- featureId: String (Unique)
- name: String
- description: String
- category: String
- standardAccess: Boolean
- premiumAccess: Boolean
- adminOverride: Boolean
- isActive: Boolean
- createdAt: DateTime
- updatedAt: DateTime
```

#### FeatureAccess
```sql
- id: String (Primary Key)
- featureId: String (Foreign Key)
- walletAddress: String (Foreign Key)
- grantedBy: String? (Admin wallet address)
- grantedAt: DateTime
- expiresAt: DateTime?
- isActive: Boolean
```

## API Endpoints

### Admin Dashboard
- `GET /admin/stats` - Get comprehensive platform statistics
- `GET /admin/actions` - Get admin action history
- `POST /admin/actions` - Get admin action history (POST)

### User Management
- `GET /admin/user` - Get detailed user information
- `POST /admin/user` - Get detailed user information (POST)
- `GET /admin/users` - Get paginated user list
- `POST /admin/users` - Get paginated user list (POST)
- `POST /admin/force-unlink-profile` - Force unlink user profile
- `POST /admin/force-link-profile` - Force link user profile
- `POST /admin/grant-premium` - Grant premium access
- `POST /admin/add-note` - Add admin note to user

### Feature Management
- `GET /admin/features` - Get feature list
- `POST /admin/features/access` - Update feature access for user

### Admin User Management
- `GET /admin/admin-user` - Get admin user information
- `POST /admin/admin-user` - Get admin user information (POST)

## Usage Examples

### Creating a SuperAdmin User

```sql
INSERT INTO "AdminUser" (
  id, walletAddress, email, username, displayName, role, isActive, createdAt, updatedAt
) VALUES (
  'admin_001', '0x1234567890abcdef', 'admin@example.com', 'superadmin', 'Super Admin', 'SuperAdmin', true, NOW(), NOW()
);
```

### Adding Permissions

```sql
INSERT INTO "AdminPermission" (
  id, adminUserId, permission, grantedAt, grantedBy
) VALUES (
  'perm_001', 'admin_001', 'user.force_unlink', NOW(), '0x1234567890abcdef'
);
```

### Creating a Feature

```sql
INSERT INTO "Feature" (
  id, featureId, name, description, category, standardAccess, premiumAccess, adminOverride, isActive, createdAt, updatedAt
) VALUES (
  'feat_001', 'premium_chat', 'Premium Chat', 'Advanced chat features for premium users', 'communication', false, true, true, true, NOW(), NOW()
);
```

## Security Considerations

### Authentication
- All admin endpoints require proper authentication
- Admin wallet addresses are validated against the AdminUser table
- Session management should be implemented for web interface

### Authorization
- Role-based access control is enforced at the API level
- Permission checks are performed before any action
- SuperAdmin role bypasses permission checks

### Audit Trail
- All admin actions are logged with full context
- Failed actions are tracked with error messages
- Action history is immutable and tamper-proof

### Data Protection
- Sensitive user data is protected
- Admin notes can be marked as private (admin-only visibility)
- Feature access changes are tracked and logged

## Monitoring and Alerts

### System Health Monitoring
- Database connectivity status
- Blockchain node connectivity
- WebSocket service status
- Error rate monitoring

### Automated Alerts
- Failed admin actions
- System connectivity issues
- Unusual activity patterns
- High error rates

## Best Practices

### Admin User Management
1. Use strong, unique wallet addresses for admin accounts
2. Regularly rotate admin credentials
3. Implement multi-factor authentication where possible
4. Monitor admin login patterns

### Action Management
1. Always provide clear reasons for admin actions
2. Use the least privileged role necessary for tasks
3. Review action logs regularly
4. Implement approval workflows for sensitive actions

### Feature Management
1. Test features thoroughly before enabling
2. Use feature flags for gradual rollouts
3. Monitor feature usage and performance
4. Document feature dependencies

### Security
1. Regularly audit admin permissions
2. Implement rate limiting on admin endpoints
3. Use HTTPS for all admin communications
4. Monitor for suspicious admin activity

## Troubleshooting

### Common Issues

#### Permission Denied Errors
- Verify the admin user exists and is active
- Check that the admin has the required permissions
- Ensure the admin role allows the requested action

#### Action Failures
- Check the action logs for detailed error messages
- Verify target user exists and is in the expected state
- Ensure all required parameters are provided

#### System Health Issues
- Check database connectivity
- Verify blockchain node status
- Monitor WebSocket service health
- Review system logs for errors

### Debugging

#### Enable Debug Logging
```typescript
// Set environment variable
DEBUG=admin:*

// Or in code
logger.setLevel('debug');
```

#### Check Action History
```bash
curl -X GET "http://localhost:3010/admin/actions?limit=10"
```

#### Verify Admin Permissions
```bash
curl -X GET "http://localhost:3010/admin/admin-user?walletAddress=0x123..."
```

## Future Enhancements

### Planned Features
1. **Advanced Analytics**: More detailed reporting and analytics
2. **Bulk Operations**: Perform actions on multiple users at once
3. **Approval Workflows**: Multi-step approval for sensitive actions
4. **Integration APIs**: Connect with external monitoring tools
5. **Mobile Admin App**: Native mobile application for admin tasks

### Performance Optimizations
1. **Caching**: Implement Redis caching for frequently accessed data
2. **Database Optimization**: Add indexes for common queries
3. **Pagination Improvements**: Virtual scrolling for large datasets
4. **Real-time Updates**: WebSocket-based real-time dashboard updates

## Support

For technical support or questions about the admin system:

1. Check the action logs for error details
2. Review the system health dashboard
3. Consult the API documentation
4. Contact the development team with specific error messages and context

## Contributing

When contributing to the admin system:

1. Follow the existing code style and patterns
2. Add comprehensive tests for new features
3. Update documentation for any API changes
4. Ensure proper error handling and logging
5. Test with different admin roles and permissions
