/**
 * Custom modules
 */
import { account } from '../lib/appwrite';

/**
 * Logs out the current user by deleting their session and navigates to the login page.
 *
 * @async
 * @function logout
 * @param {Function} navigate - The navigation function to redirect the user after logout.
 * @returns {Promise<void>} - Returns a promise that resolves once the session is deleted and navigation occurs.
 * @throws {Error} If there is an issue deleting the user session, the error will be logged to the console.
 */
export async function logout() {
  try {
    await account.deleteSession('current');
  } catch (e) {
    // Optionally handle error
  }
}
