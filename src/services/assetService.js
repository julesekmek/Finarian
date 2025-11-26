import { supabase } from "./supabase";

export const assetService = {
  /**
   * Fetch all assets for a user
   * @param {string} userId
   * @returns {Promise<Array>}
   */
  async fetchAssets(userId) {
    const { data, error } = await supabase
      .from("assets")
      .select("*")
      .eq("user_id", userId)
      .order("last_updated", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Create a new asset
   * @param {Object} asset
   * @returns {Promise<Object>}
   */
  async createAsset(asset) {
    const { data, error } = await supabase
      .from("assets")
      .insert([asset])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update an existing asset
   * @param {string} id
   * @param {Object} updates
   * @returns {Promise<Object>}
   */
  async updateAsset(id, updates) {
    const { data, error } = await supabase
      .from("assets")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete an asset
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  async deleteAsset(id) {
    const { error } = await supabase.from("assets").delete().eq("id", id);

    if (error) throw error;
    return true;
  },

  /**
   * Subscribe to asset changes
   * @param {string} userId
   * @param {Function} callback
   * @returns {Object} RealtimeChannel
   */
  subscribeToAssets(userId, callback) {
    return supabase
      .channel(`realtime:assets:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "assets",
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  },

  /**
   * Remove a realtime channel
   * @param {Object} channel
   */
  removeChannel(channel) {
    supabase.removeChannel(channel);
  },
};
