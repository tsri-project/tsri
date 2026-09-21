// LINE OA Messaging API Notification Integration (Server-side Only)

export interface LineFlexMessageOptions {
  title: string;
  projectName: string;
  category: string;
  statusText: string;
  actionUrl: string;
}

export async function sendLineDirectNotification(
  message: string,
  options?: LineFlexMessageOptions
): Promise<{ success: boolean; error?: string }> {
  const lineToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const targetUserId = process.env.LINE_user_ID || process.env.LINE_USER_ID;

  if (!lineToken || lineToken === 'your-line-channel-token') {
    console.log('[LINE OA Direct Notification Simulation]:', message, options);
    return { success: true };
  }

  try {
    const payload = options
      ? {
          to: targetUserId,
          messages: [
            {
              type: 'flex',
              altText: `แจ้งเตือน TSRI One Link: ${options.title}`,
              contents: {
                type: 'bubble',
                header: {
                  type: 'box',
                  layout: 'vertical',
                  backgroundColor: '#1E3E7F',
                  contents: [
                    {
                      type: 'text',
                      text: 'TSRI ONE LINK NOTIFICATION',
                      color: '#67AAF0',
                      size: 'xxs',
                      weight: 'bold',
                    },
                    {
                      type: 'text',
                      text: options.title,
                      color: '#FFFFFF',
                      size: 'md',
                      weight: 'bold',
                      wrap: true,
                    },
                  ],
                },
                body: {
                  type: 'box',
                  layout: 'vertical',
                  contents: [
                    {
                      type: 'text',
                      text: `โครงการ: ${options.projectName}`,
                      size: 'xs',
                      color: '#666666',
                    },
                    {
                      type: 'text',
                      text: `หมวดหมู่: ${options.category} (${options.statusText})`,
                      size: 'xs',
                      color: '#333333',
                      margin: 'md',
                    },
                  ],
                },
                footer: {
                  type: 'box',
                  layout: 'vertical',
                  contents: [
                    {
                      type: 'button',
                      style: 'primary',
                      color: '#2D6DDC',
                      action: {
                        type: 'uri',
                        label: 'เปิดดูในระบบ Control Center',
                        uri: options.actionUrl,
                      },
                    },
                  ],
                },
              },
            },
          ],
        }
      : {
          to: targetUserId,
          messages: [
            {
              type: 'text',
              text: `[TSRI One Link Alert]\n${message}`,
            },
          ],
        };

    const endpoint = targetUserId
      ? 'https://api.line.me/v2/bot/message/push'
      : 'https://api.line.me/v2/bot/message/broadcast';

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${lineToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      return { success: false, error: errText };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
