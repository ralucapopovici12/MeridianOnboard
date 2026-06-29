namespace backend.Models;

/// <summary>
/// The columns of a personal task board, Jira/Linear-style:
/// Backlog → To Do → In Progress → In Review → Done.
/// Stored as a string in the database for readability.
/// </summary>
public enum BoardStatus
{
    Backlog,
    Todo,
    InProgress,
    InReview,
    Done,
}
