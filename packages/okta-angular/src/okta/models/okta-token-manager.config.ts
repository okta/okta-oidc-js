/**
 * @export
 * @interface OktaTokenManagerConfig
 *
 * This interface represents the possible known properties for configuring the Okta token manager.
 */
export interface OktaTokenManagerConfig{
    storage?: string;
    autoRefresh?: boolean;
}