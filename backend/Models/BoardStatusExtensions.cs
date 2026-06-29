namespace backend.Models;

public static class BoardStatusExtensions
{
    /// <summary>Human-friendly column label.</summary>
    public static string Label(this BoardStatus status) => status switch
    {
        BoardStatus.Backlog => "Backlog",
        BoardStatus.Todo => "To Do",
        BoardStatus.InProgress => "In Progress",
        BoardStatus.InReview => "In Review",
        BoardStatus.Done => "Done",
        _ => status.ToString(),
    };

    /// <summary>Columns left-to-right.</summary>
    public static readonly BoardStatus[] InOrder =
    {
        BoardStatus.Backlog,
        BoardStatus.Todo,
        BoardStatus.InProgress,
        BoardStatus.InReview,
        BoardStatus.Done,
    };
}
