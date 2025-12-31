'use server';

export async function testServerAction(message: string) {
    console.log('Test Action Received:', message);
    return { success: true, reply: 'Server received: ' + message };
}
