namespace backend.Services;

/// <summary>
/// Deterministic avatar photos for the demo directory. Keyed by email so each
/// person always gets the same face everywhere in the app. The images are
/// gender-matched portraits bundled in the frontend's <c>public/avatars</c>
/// folder (filename = the email's local part, e.g. "andrei.popa.jpg").
/// </summary>
public static class Avatars
{
    public static string UrlFor(string email)
    {
        var localPart = email.Split('@')[0].ToLowerInvariant();
        return $"/avatars/{localPart}.jpg";
    }
}
